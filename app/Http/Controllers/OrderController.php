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
            'order_date' => 'required|date',
            'total_amount' => 'required|numeric',
            'status_id' => 'required|exists:statuses,id',
            'payment_status_id' => 'required|exists:statuses,id',
            'created_by' => 'required|exists:users,id',
            'updated_by' => 'required|exists:users,id',
        ]);

        return Order::create($request->all());
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
            'order_date' => 'sometimes|required|date',
            'total_amount' => 'sometimes|required|numeric',
            'status_id' => 'sometimes|required|exists:statuses,id',
            'payment_status_id' => 'sometimes|required|exists:statuses,id',
            'created_by' => 'sometimes|required|exists:users,id',
            'updated_by' => 'sometimes|required|exists:users,id',
        ]);

        $order->update($request->all());

        return $order;
    }

    public function destroy($id)
    {
        $order = Order::findOrFail($id);
        $order->delete();

        return response()->noContent();
    }
}
