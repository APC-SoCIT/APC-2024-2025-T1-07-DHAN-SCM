<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index()
    {
        return Order::with(['company', 'status', 'paymentStatus', 'creator', 'updater'])->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'company_id' => 'required|exists:companies,id',
            'megaion_order_number' => 'required|string|unique:orders,megaion_order_number',
            'company_order_number' => 'required|string|unique:orders,company_order_number',
            'order_date' => 'required|date',
            'total_amount' => 'required|numeric',
            'status_id' => 'required|exists:statuses,id',
            'payment_status_id' => 'required|exists:statuses,id',
        ]);

        return Order::create(array_merge($request->all(), [
            'created_by' => auth()->id(),
            'updated_by' => auth()->id(),
        ]));
    }

    public function show($id)
    {
        return Order::with(['company', 'status', 'paymentStatus', 'creator', 'updater'])->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        $request->validate([
            'company_id' => 'sometimes|required|exists:companies,id',
            'megaion_order_number' => 'sometimes|required|string|unique:orders,megaion_order_number,' . $id,
            'company_order_number' => 'sometimes|required|string|unique:orders,company_order_number,' . $id,
            'order_date' => 'sometimes|required|date',
            'total_amount' => 'sometimes|required|numeric',
            'status_id' => 'sometimes|required|exists:statuses,id',
            'payment_status_id' => 'sometimes|required|exists:statuses,id',
        ]);

        $order->update(array_merge($request->all(), [
            'updated_by' => auth()->id(),
        ]));

        return $order;
    }

    public function destroy($id)
    {
        $order = Order::findOrFail($id);
        $order->delete();

        return response()->noContent();
    }
}