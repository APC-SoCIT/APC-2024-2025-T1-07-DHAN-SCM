<?php

namespace App\Http\Controllers;

use App\Models\PaymentTransaction;
use Illuminate\Http\Request;

class PaymentTransactionController extends Controller
{
    public function index()
    {
        return PaymentTransaction::with(['billing', 'createdBy', 'updatedBy'])->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'billing_id' => 'required|exists:billings,id',
            'payment_date' => 'required|date',
            'amount_paid' => 'required|numeric',
            'payment_method' => 'required',
            'is_pdc' => 'required|boolean',
            'cheque_clearance_date' => 'nullable|date',
            'created_by' => 'required|exists:users,id',
            'updated_by' => 'required|exists:users,id',
        ]);

        return PaymentTransaction::create($request->all());
    }

    public function show($id)
    {
        return PaymentTransaction::with(['billing', 'createdBy', 'updatedBy'])->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $paymentTransaction = PaymentTransaction::findOrFail($id);

        $request->validate([
            'billing_id' => 'sometimes|required|exists:billings,id',
            'payment_date' => 'sometimes|required|date',
            'amount_paid' => 'sometimes|required|numeric',
            'payment_method' => 'sometimes|required',
            'is_pdc' => 'sometimes|required|boolean',
            'cheque_clearance_date' => 'nullable|date',
            'created_by' => 'sometimes|required|exists:users,id',
            'updated_by' => 'sometimes|required|exists:users,id',
        ]);

        $paymentTransaction->update($request->all());

        return $paymentTransaction;
    }

    public function destroy($id)
    {
        $paymentTransaction = PaymentTransaction::findOrFail($id);
        $paymentTransaction->delete();

        return response()->noContent();
    }
}
