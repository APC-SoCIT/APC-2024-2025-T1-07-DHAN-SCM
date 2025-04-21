<?php

namespace App\Http\Controllers;

use App\Models\OrderItem;
use Illuminate\Http\Request;

class OrderItemController extends Controller
{
    public function index()
    {
        return OrderItem::with(['order', 'product', 'creator', 'updater'])->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id',
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|numeric',
            'unit_price' => 'required|numeric',
            'discount' => 'nullable|numeric|min:0', // ✅ Added discount validation
            'total_price' => 'required|numeric',
            'created_by' => 'required|exists:users,id',
            'updated_by' => 'required|exists:users,id',
        ]);

        return OrderItem::create($request->all());
    }

    public function show($id)
    {
        return OrderItem::with(['order', 'product', 'creator', 'updater'])->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $orderItem = OrderItem::findOrFail($id);

        $request->validate([
            'order_id' => 'sometimes|required|exists:orders,id',
            'product_id' => 'sometimes|required|exists:products,id',
            'quantity' => 'sometimes|required|numeric',
            'unit_price' => 'sometimes|required|numeric',
            'discount' => 'sometimes|nullable|numeric|min:0', // ✅ Added discount validation
            'total_price' => 'sometimes|required|numeric',
            'created_by' => 'sometimes|required|exists:users,id',
            'updated_by' => 'sometimes|required|exists:users,id',
        ]);

        $orderItem->update($request->all());

        return $orderItem;
    }

    public function destroy($id)
    {
        $orderItem = OrderItem::findOrFail($id);
        $orderItem->delete();

        return response()->noContent();
    }
}