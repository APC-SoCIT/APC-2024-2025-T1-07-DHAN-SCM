<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index()
    {
        return Order::with(['company', 'status', 'creator', 'updater', 'orderItems.product'])->get();
    }

    public function show($id)
    {
        return Order::with(['company', 'status', 'creator', 'updater', 'orderItems.product'])->findOrFail($id);
    }


    public function store(Request $request)
    {
        $request->validate([
            'company_id' => 'required|exists:companies,id',
            'company_order_number' => 'nullable|string|unique:orders,company_order_number',
            'order_date' => 'required|date',
            'total_amount' => 'nullable|numeric',
            'status_id' => 'required|exists:statuses,id',
            'order_items' => 'required|array', // Ensure order items are an array
            'order_items.*.product_id' => 'required|exists:products,id',
            'order_items.*.quantity' => 'required|numeric',
            'order_items.*.unit_price' => 'required|numeric',
            'order_items.*.total_price' => 'required|numeric',
        ]);
    
        DB::beginTransaction();
    
        try {
            // Create the Order (excluding megaion_order_number)
            $order = Order::create(array_merge($request->except('order_items'), [
                'created_by' => auth()->id(),
                'updated_by' => auth()->id(),
            ]));
    
            // Generate the MEGA order number based on the inserted ID
            $order->update([
                'megaion_order_number' => 'MEGA' . str_pad($order->id, 6, '0', STR_PAD_LEFT),
            ]);
    
            // Insert order items
            foreach ($request->order_items as $item) {
                OrderItem::create(array_merge($item, [
                    'order_id' => $order->id,
                    'created_by' => auth()->id(),
                    'updated_by' => auth()->id(),
                ]));
            }
    
            DB::commit();
    
            return response()->json($order->load('orderItems'), 201);
        } catch (Exception $e) {
            DB::rollBack();
    
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

   
   

    public function destroy($id)
    {
        $order = Order::findOrFail($id);
        $order->delete();

        return response()->noContent();
    }
}