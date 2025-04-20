<?php

namespace App\Http\Controllers;

use auth;
use DateTime;
use App\Models\Barcode;
use Illuminate\Http\Request;
use App\Models\PurchaseOrderItem;
use App\Models\InventoryEquipment;
use App\Models\InventoryConsumable;

class BarcodeController extends Controller
{
    /**
     * Display a listing of barcodes.
     */
    public function index()
    {
        $barcodes = Barcode::all(); // Retrieve all barcodes
        return response()->json($barcodes);
    }

    /**
     * Store a newly created barcode in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'product_type_id' => 'required|exists:product_types,id',
            'product_id' => 'required|exists:products,id',
            'purchase_order_item_id' => 'nullable|exists:purchase_order_items,id',
            'barcode' => 'required|unique:barcodes',
        ]);

        $barcode = Barcode::create([
            'product_type_id' => $request->product_type_id,
            'product_id' => $request->product_id,
            'purchase_order_item_id' => $request->purchase_order_item_id,
            'barcode' => $request->barcode,
            'read_status' => false, // Default value
            'created_by' => auth()->id(),
            'updated_by' => auth()->id(),
        ]);

        return response()->json(['message' => 'Barcode created successfully', 'barcode' => $barcode], 201);
    }

    /**
     * Display the specified barcode.
     */
    public function show($id)
    {
        $barcode = Barcode::findOrFail($id); // Find the barcode by ID
        return response()->json($barcode);
    }

    /**
     * Update the specified barcode in storage.
     */
    public function update(Request $request, $id)
    {
        $barcode = Barcode::findOrFail($id);

        $request->validate([
            'product_type_id' => 'required|exists:product_types,id',
            'product_id' => 'required|exists:products,id',
            'purchase_order_item_id' => 'nullable|exists:purchase_order_items,id',
            'barcode' => 'required|unique:barcodes,barcode,' . $barcode->id,
        ]);

        $barcode->update([
            'product_type_id' => $request->product_type_id,
            'product_id' => $request->product_id,
            'purchase_order_item_id' => $request->purchase_order_item_id,
            'barcode' => $request->barcode,
            'updated_by' => auth()->id(),
        ]);

        return response()->json(['message' => 'Barcode updated successfully', 'barcode' => $barcode]);
    }

    /**
     * Remove the specified barcode from storage.
     */
    public function destroy($id)
    {
        $barcode = Barcode::findOrFail($id);
        $barcode->delete();

        return response()->json(['message' => 'Barcode deleted successfully']);
    }


    public function generateAndSaveBarcodes($delivery, $lot, $expiryDate, $serial, $deliveredQuantity, $userId)
    {
        $barcodes = [];

        for ($i = 1; $i <= $deliveredQuantity; $i++) {
            $type = $delivery->purchase_order_item_id ? 'P' : 'M'; // Determine type (P for PO item, M for manual)
            $category = $serial ? 'E' : ($lot && $expiryDate ? 'C' : null); // Determine category (C for consumables, E for equipment)

            if (!$category) {
                continue; // Skip invalid cases
            }

            // Determine the barcode prefix
            $barcodeType = "{$type}{$category}"; // 'PC' for consumables, 'PE' for equipment

            // Clean the serial number to remove special characters
            $cleanSerial = preg_replace("/[^a-zA-Z0-9]/", "", $serial);

            // Create the barcode record
            $barcodeRecord = Barcode::create([
                'product_type_id' => $delivery->purchase_order_item_id
                    ? PurchaseOrderItem::find($delivery->purchase_order_item_id)->product->productGroup->product_type_id
                    : null,
                'product_id' => $delivery->purchase_order_item_id
                    ? PurchaseOrderItem::find($delivery->purchase_order_item_id)->product_id
                    : null,
                'purchase_order_item_id' => $delivery->purchase_order_item_id,
                'lot_number' => $lot, // Use lot number for consumables
                'expiry_date' => $expiryDate ? date('Y-m-d', strtotime($expiryDate)) : null, // Use expiry date for consumables
                'serial_number' => $cleanSerial, // Use cleaned serial number for equipment
                'read_status' => false,
                'created_by' => $userId,
                'updated_by' => $userId,
            ]);

            // Determine the barcode format based on category
            if ($category === 'C') { // Consumables
                // Format: {prefix}-{lot}-{expirydate}-{id}
                $formattedExpiryDate = $expiryDate ? date('ymd', strtotime($expiryDate)) : '000000';
                $barcodeValue = "{$barcodeType}-{$lot}-{$formattedExpiryDate}-{$barcodeRecord->id}";
            } elseif ($category === 'E') { // Equipment
                // Format: {prefix}-{serial}-{0}-{id}
                $barcodeValue = "{$barcodeType}-{$cleanSerial}-0-{$barcodeRecord->id}";
            } else {
                continue; // Skip cases that don’t match valid categories
            }

            // Update the barcode record with the finalized barcode
            $barcodeRecord->barcode = $barcodeValue;
            $barcodeRecord->save();

            // Add to the response array
            $barcodes[] = [
                'barcode' => $barcodeRecord->barcode,
            ];
        }

        return $barcodes;
    }
    
    public function saveScannedBarcodes(Request $request)
    {
        $barcodes = $request->input('barcodes'); // Array of scanned barcodes
    
        if (!is_array($barcodes) || empty($barcodes)) {
            return response()->json(['message' => 'Invalid or empty barcode array provided'], 422);
        }
    
        $savedItems = [];
        foreach ($barcodes as $barcodeValue) {
            // Parse the barcode components based on format
            $barcodeParts = explode('-', $barcodeValue);
    
            // Barcode must have at least 4 parts for validity
            if (count($barcodeParts) < 4) {
                return response()->json(['message' => "Invalid barcode format: $barcodeValue"], 422);
            }
    
            // Extract type and category from the barcode prefix (e.g., "PC" or "PE")
            $typeCategoryPrefix = $barcodeParts[0]; // E.g., "PC" for consumables or "PE" for equipment
            $lotOrSerial = $barcodeParts[1]; // LOT for consumables, SERIAL for equipment
            $extraPart = $barcodeParts[2]; // Placeholder (0 for equipment or expiry for consumables)
            $barcodeId = $barcodeParts[3]; // Extract Barcode ID
    
            // Fetch the barcode record from the database
            $barcode = Barcode::where('id', $barcodeId)->first();
            if (!$barcode) {
                return response()->json(['message' => "Barcode not found: $barcodeValue"], 404);
            }
            // Remove the barcode ID (incremental part) from the barcode
            $barcodeWithoutId = substr($barcode->barcode, 0, strrpos($barcode->barcode, '-')); // Extract main part of the barcode

    
            // Determine inventory type based on type-category prefix
            if (str_contains($typeCategoryPrefix, 'C')) { // Consumables (e.g., "PC")
                // Find existing inventory item based on barcode (without ID), lot number, and expiry date
                $inventoryItem = InventoryConsumable::where('barcode', $barcodeWithoutId) // Match barcode without the incremental part
                    ->where('lot_number', $barcode->lot_number) // Match lot number
                    ->where('expiry_date', $barcode->expiry_date) // Match expiry date
                    ->first();
    
                if ($inventoryItem) {
                    $inventoryItem->quantity += 1; // Increment quantity
                    $inventoryItem->updated_by = auth()->id();
                    $inventoryItem->save();
                } else {
                    // Save the barcode without ID and other details in InventoryConsumable
                    $inventoryItem = InventoryConsumable::create([
                        'product_id' => $barcode->product_id,
                        'purchase_order_item_id' => $barcode->purchase_order_item_id,
                        'barcode' => $barcodeWithoutId, // Save barcode without ID
                        'lot_number' => $barcode->lot_number, // Store lot number
                        'expiry_date' => $barcode->expiry_date, // Store expiry date
                        'quantity' => 1,
                        'notes' => 'Scanned and saved',
                        'created_by' => auth()->id(),
                        'updated_by' => auth()->id(),
                    ]);
                }
            } elseif (str_contains($typeCategoryPrefix, 'E')) { // Equipment (e.g., "PE")
                // Remove special characters from serial number for consistency
                $cleanSerial = preg_replace("/[^a-zA-Z0-9]/", "", $barcode->serial_number);
    
                // Handle equipment logic
                $inventoryItem = InventoryEquipment::create([
                    'product_id' => $barcode->product_id,
                    'purchase_order_item_id' => $barcode->purchase_order_item_id,
                    'barcode' => $barcodeWithoutId,
                    'serial_number' => $cleanSerial, // Store cleaned serial number
                    'notes' => 'Scanned and saved',
                    'status_id' => 19, // Default status
                    'created_by' => auth()->id(),
                    'updated_by' => auth()->id(),
                ]);
            } else {
                continue; // Skip invalid types
            }
    
            // Add the processed barcode information to the saved items array
            $savedItems[] = [
                'barcode' => $barcodeValue,
                'inventory_type' => str_contains($typeCategoryPrefix, 'C') ? 'consumable' : 'equipment',
                'inventory_id' => $inventoryItem->id,
            ];
        }
    
        return response()->json([
            'message' => 'Barcodes saved successfully to inventory',
            'data' => $savedItems,
        ]);
    }


}