<?php

namespace App\Http\Controllers;

use App\Models\PurchaseOrderStatus;
use Illuminate\Http\Request;

class PurchaseOrderStatusController extends Controller
{
    public function index()
    {
        return PurchaseOrderStatus::with(['purchaseOrder', 'status', 'creator', 'updater'])->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'purchase_order_id' => 'required|exists:purchase_orders,id',
            'status_id' => 'required|exists:statuses,id',
            'status_date' => 'required|date',
            'comments' => 'required',
            'created_by' => 'required|exists:users,id',
            'updated_by' => 'required|exists:users,id',
        ]);

        return PurchaseOrderStatus::create($request->all());
    }

    public function show($id)
    {
        return PurchaseOrderStatus::with(['purchaseOrder', 'status', 'creator', 'updater'])->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $purchaseOrderStatus = PurchaseOrderStatus::findOrFail($id);

        $request->validate([
            'purchase_order_id' => 'sometimes|required|exists:purchase_orders,id',
            'status_id' => 'sometimes|required|exists:statuses,id',
            'status_date' => 'sometimes|required|date',
            'comments' => 'sometimes|required',
            'created_by' => 'sometimes|required|exists:users,id',
            'updated_by' => 'sometimes|required|exists:users,id',
        ]);

        $purchaseOrderStatus->update($request->all());

        return $purchaseOrderStatus;
    }

    public function destroy($id)
    {
        $purchaseOrderStatus = PurchaseOrderStatus::findOrFail($id);
        $purchaseOrderStatus->delete();

        return response()->noContent();
    }
}
