<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\IncomingStock;
use App\Models\OutgoingStock;

class OutgoingStockController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $validatedData = $request->validate([
            'product_id' => 'required|exists:products,id' // Ensures valid product ID
        ]);
    
        // Find all incoming stock IDs related to the product
        $incomingIds = IncomingStock::where('product_id', $validatedData['product_id'])->pluck('id');
    
        // Fetch outgoing stock data based on found incoming stock IDs
        $outgoingStocks = OutgoingStock::whereIn('incoming_stock_id', $incomingIds)->get();
    
        return response()->json($outgoingStocks);
    }
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'demo_unit_id' => 'nullable|exists:demo_units,id',
            'order_item_id' => 'nullable|exists:purchase_order_items,id',
            'incoming_stock_id' => 'required|exists:incoming_stocks,id',
            'type' => 'required|string',
            'remarks' => 'nullable|string',
        ]);

        $outgoingStock = OutgoingStock::create($validatedData);

        return response()->json($outgoingStock, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(OutgoingStock $outgoingStock)
    {
        return response()->json($outgoingStock);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, OutgoingStock $outgoingStock)
    {
        $validatedData = $request->validate([
            'demo_unit_id' => 'nullable|exists:demo_units,id',
            'order_item_id' => 'nullable|exists:purchase_order_items,id',
            'incoming_stock_id' => 'exists:incoming_stocks,id',
            'type' => 'string',
            'remarks' => 'nullable|string',
        ]);

        $outgoingStock->update($validatedData);

        return response()->json($outgoingStock);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(OutgoingStock $outgoingStock)
    {
        $outgoingStock->delete();

        return response()->json(['message' => 'Deleted successfully']);
    }
}