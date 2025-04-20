<?php

namespace App\Http\Controllers;

use App\Models\IncomingStock;
use Illuminate\Http\Request;

class IncomingStocksController extends Controller
{
    /**
     * Update serial_number, lot_number, and expiration_date for stocks by purchase_order_item_id and product_id.
     */
    public function updateIncomingStock(Request $request)
{
    // ✅ Validate Request
    $validatedData = $request->validate([
        'barcodes' => 'required|array|min:1',
        'serial_number' => 'nullable|string|max:255',
        'lot_number' => 'nullable|string|max:255',
        'expiration_date' => 'nullable|date',
    ]);

    // ✅ Find Incoming Stocks Matching Barcodes
    $incomingStocks = IncomingStock::whereIn('barcode', $validatedData['barcodes'])->get();

    if ($incomingStocks->isEmpty()) {
        return response()->json(['message' => 'No matching incoming stocks found for the provided barcodes'], 404);
    }

    // ✅ Skip validation if no updates are being made
    $changesMade = !empty($validatedData['serial_number']) ||
                   !empty($validatedData['lot_number']) ||
                   !empty($validatedData['expiration_date']);

    if ($changesMade) {
        // ✅ Ensure serial_number is unique ONLY IF it's being changed
        if (!empty($validatedData['serial_number'])) {
            $exists = IncomingStock::where('serial_number', $validatedData['serial_number'])
                ->whereNotIn('barcode', $validatedData['barcodes']) // Exclude current records
                ->exists();
            if ($exists) {
                return response()->json(['message' => 'Serial number already exists.'], 200);
            }
        }

        // ✅ Ensure lot_number & expiration_date combo is unique ONLY IF it's being changed
        if (!empty($validatedData['lot_number']) && !empty($validatedData['expiration_date'])) {
            $exists = IncomingStock::where('lot_number', $validatedData['lot_number'])
                ->where('expiration_date', $validatedData['expiration_date'])
                ->whereNotIn('barcode', $validatedData['barcodes']) // Exclude current records
                ->exists();
            if ($exists) {
                return response()->json(['message' => 'This lot number and expiration date combination already exists.'], 200);
            }
        }
    }

    // ✅ Bulk Update Matching Stocks
    foreach ($incomingStocks as $stock) {
        $stock->update([
            'serial_number' => $validatedData['serial_number'] ?? $stock->serial_number,
            'lot_number' => $validatedData['lot_number'] ?? $stock->lot_number,
            'expiration_date' => $validatedData['expiration_date'] ?? $stock->expiration_date,
            'updated_by_user_id' => auth()->id(), // Track updater
        ]);
    }

    return response()->json([
        'message' => 'Incoming stocks updated successfully',
        'updated_stocks' => $incomingStocks->fresh(),
    ]);
}

}