<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Status;
use Illuminate\Http\Request;
use App\Models\IncomingStock;
use App\Models\PurchaseOrderItem;
use App\Models\PurchaseOrderStatus;
use Illuminate\Support\Facades\Auth;
use App\Models\PurchaseOrderItemDelivery;


class PurchaseOrderItemDeliveryController extends Controller
{
    public function index()
    {
        $deliveries = PurchaseOrderItemDelivery::with('purchaseOrderItem')->get();
        return response()->json($deliveries);
    }

    

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'delivered_quantity' => 'integer|min:1',
            'delivery_date' => 'date',
            'updated_by' => 'exists:users,id',
        ]);

        $delivery = PurchaseOrderItemDelivery::findOrFail($id);
        $delivery->update($validated);

        return response()->json($delivery);
    }

    public function destroy($id)
    {
        $delivery = PurchaseOrderItemDelivery::findOrFail($id);
        $delivery->delete();

        return response()->json(['message' => 'Delivery deleted successfully.']);
    }


    public function store(Request $request)
    {
        // Get authenticated user ID
        $userId = Auth::id();
    
        // Validate request input
        $validated = $request->validate([
            'purchase_order_item_id' => 'required|exists:purchase_order_items,id',
            'delivered_quantity' => ['required', 'integer', 'min:1'],
            'delivery_date' => 'required|date',
            'lot_number' => 'nullable|string',
            'expiration_date' => 'nullable|date',
            'serial_number' => 'nullable|string',
        ]);
    
        // Fetch the purchase order item and its product
        $purchaseOrderItem = PurchaseOrderItem::with('product', 'purchaseOrder')->find($validated['purchase_order_item_id']);
        if (!$purchaseOrderItem || !$purchaseOrderItem->product) {
            return response()->json(['message' => 'Invalid purchase order item or missing associated product.'], 422);
        }
    
        // Calculate total delivered quantity
        $totalDelivered = PurchaseOrderItemDelivery::where('purchase_order_item_id', $validated['purchase_order_item_id'])
            ->sum('delivered_quantity');
    
        $remainingQuantity = $purchaseOrderItem->quantity - $totalDelivered;
    
        // Ensure the delivered quantity does not exceed the remaining quantity
        if ($validated['delivered_quantity'] > $remainingQuantity) {
            return response()->json([
                'message' => "The delivered quantity ({$validated['delivered_quantity']}) exceeds the remaining quantity ({$remainingQuantity})."
            ], 422);
        }
    
        // Get product details
        $productId = $purchaseOrderItem->product->id;
        $currentYear = now()->format('Y'); 
    
        // Convert expiration date to proper format
        if (!empty($validated['expiration_date'])) {
            try {
                $validated['expiration_date'] = Carbon::parse($validated['expiration_date'])->format('Y-m-d');
            } catch (\Exception $e) {
                return response()->json(['message' => 'Invalid expiration date format. Use DD-MM-YYYY.'], 422);
            }
        }
    
        // Save delivery record
        $deliveryRecord = PurchaseOrderItemDelivery::create([
            'purchase_order_item_id' => $validated['purchase_order_item_id'],
            'delivered_quantity' => $validated['delivered_quantity'],
            'delivery_date' => $validated['delivery_date'],
            'created_by' => $userId,
            'updated_by' => $userId,
        ]);

        $barcodes = [];

        // Store each item separately with a **unique barcode**
        for ($i = 0; $i < $validated['delivered_quantity']; $i++) {
            $currentYear = now()->format('Y');
            $barcode = "{$currentYear}" . str_pad(mt_rand(0, 999999), 6, '0', STR_PAD_LEFT);

            $incomingStock = IncomingStock::create([
                'purchase_order_item_id' => $validated['purchase_order_item_id'],
                'purchase_order_item_delivery_id' => $deliveryRecord->id, // ✅ Updated to use the saved delivery record
                'serial_number' => $validated['serial_number'] ?? null,
                'lot_number' => $validated['lot_number'] ?? null,
                'expiration_date' => $validated['expiration_date'] ?? null,
                'product_id' => $productId,
                'barcode' => $barcode,
                'quantity' => 1,
                'created_by_user_id' => $userId,
                'updated_by_user_id' => $userId,
            ]);

            $barcodes[] = $barcode;
        }
    
       // **Check total ordered vs delivered quantity**
        $totalOrdered = PurchaseOrderItem::where('purchase_order_id', $purchaseOrderItem->purchase_order_id)->sum('quantity');
        $totalDeliveredOverall = PurchaseOrderItemDelivery::whereIn('purchase_order_item_id', 
            PurchaseOrderItem::where('purchase_order_id', $purchaseOrderItem->purchase_order_id)->pluck('id')
        )->sum('delivered_quantity');

        if ($totalDeliveredOverall >= $totalOrdered) {
            // **All items delivered: Mark as "Delivered"**
            $purchaseOrderItem->purchaseOrder->update(['status_id' => $this->getStatusId('Delivered')]);

            // Add status update
            PurchaseOrderStatus::create([
                'purchase_order_id' => $purchaseOrderItem->purchase_order_id,
                'status_id' => $this->getStatusId('Delivered'),
                'status_date' => now(),
                'comments' => 'All items have been delivered. Status updated to Delivered.',
                'created_by' => $userId,
                'updated_by' => $userId,
            ]);
        } elseif ($totalDeliveredOverall > 0) {
            // **Some items delivered: Mark as "Partially Received"**
            $purchaseOrderItem->purchaseOrder->update(['status_id' => $this->getStatusId('Partially Received')]);

            // Add status update
            PurchaseOrderStatus::create([
                'purchase_order_id' => $purchaseOrderItem->purchase_order_id,
                'status_id' => $this->getStatusId('Partially Received'),
                'status_date' => now(),
                'comments' => 'Some items have been delivered. Status updated to Partially Received.',
                'created_by' => $userId,
                'updated_by' => $userId,
            ]);
        }
            
        return response()->json([
            'barcodes' => $barcodes,
        ], 201);
    }

    private function getStatusId($statusName)
    {
        return Status::where('name', $statusName)->first()->id;
    }

}
