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
            'discount' => 'nullable|numeric|min:0',
            'total_price' => 'required|numeric',
        ]);

        return OrderItem::create(array_merge($request->all(), [
            'created_by' => auth()->id(),
            'updated_by' => auth()->id(),
        ]));
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
            'discount' => 'sometimes|nullable|numeric|min:0',
            'total_price' => 'sometimes|required|numeric',
        ]);

        $orderItem->update(array_merge($request->all(), [
            'updated_by' => auth()->id(),
        ]));

        return $orderItem;
    }

    public function destroy($id)
    {
        $orderItem = OrderItem::findOrFail($id);
        $orderItem->delete();

        return response()->noContent();
    }
}