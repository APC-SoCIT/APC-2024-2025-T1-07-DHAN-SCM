<?php

namespace App\Http\Controllers;

use App\Models\OrderItemPayment;
use Illuminate\Http\Request;

class OrderItemPaymentController extends Controller
{
    public function index()
    {
        return OrderItemPayment::with(['paymentTransaction', 'orderItem', 'createdBy', 'updatedBy'])->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'payment_transaction_id' => 'required|exists:payment_transactions,id',
            'order_item_id' => 'required|exists:order_items,id',
            'payment_date' => 'required|date',
            'amount_paid' => 'required|numeric',
            'remarks' => 'nullable',
            'created_by' => 'required|exists:users,id',
            'updated_by' => 'required|exists:users,id',
        ]);

        return OrderItemPayment::create($request->all());
    }

    public function show($id)
    {
        return OrderItemPayment::with(['paymentTransaction', 'orderItem', 'createdBy', 'updatedBy'])->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $orderItemPayment = OrderItemPayment::findOrFail($id);

        $request->validate([
            'payment_transaction_id' => 'sometimes|required|exists:payment_transactions,id',
            'order_item_id' => 'sometimes|required|exists:order_items,id',
            'payment_date' => 'sometimes|required|date',
            'amount_paid' => 'sometimes|required|numeric',
            'remarks' => 'nullable',
            'created_by' => 'sometimes|required|exists:users,id',
            'updated_by' => 'sometimes|required|exists:users,id',
        ]);

        $orderItemPayment->update($request->all());

        return $orderItemPayment;
    }

    public function destroy($id)
    {
        $orderItemPayment = OrderItemPayment::findOrFail($id);
        $orderItemPayment->delete();

        return response()->noContent();
    }
}
