<?php

namespace App\Http\Controllers;

use App\Models\Billing;
use Illuminate\Http\Request;

class BillingController extends Controller
{
    public function index()
    {
        return Billing::with(['order', 'status', 'createdBy', 'updatedBy'])->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id',
            'billing_date' => 'required|date',
            'due_date' => 'required|date',
            'total_amount' => 'required|numeric',
            'amount_paid' => 'required|numeric',
            'remaining_balance' => 'required|numeric',
            'status_id' => 'required|exists:statuses,id',
            'created_by' => 'required|exists:users,id',
            'updated_by' => 'required|exists:users,id',
        ]);

        return Billing::create($request->all());
    }

    public function show($id)
    {
        return Billing::with(['order', 'status', 'createdBy', 'updatedBy'])->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $billing = Billing::findOrFail($id);

        $request->validate([
            'order_id' => 'sometimes|required|exists:orders,id',
            'billing_date' => 'sometimes|required|date',
            'due_date' => 'sometimes|required|date',
            'total_amount' => 'sometimes|required|numeric',
            'amount_paid' => 'sometimes|required|numeric',
            'remaining_balance' => 'sometimes|required|numeric',
            'status_id' => 'sometimes|required|exists:statuses,id',
            'created_by' => 'sometimes|required|exists:users,id',
            'updated_by' => 'sometimes|required|exists:users,id',
        ]);

        $billing->update($request->all());

        return $billing;
    }

    public function destroy($id)
    {
        $billing = Billing::findOrFail($id);
        $billing->delete();

        return response()->noContent();
    }
}
