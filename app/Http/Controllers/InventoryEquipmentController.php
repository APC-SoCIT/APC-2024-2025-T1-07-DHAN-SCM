<?php

namespace App\Http\Controllers;

use App\Models\InventoryEquipment;
use Illuminate\Http\Request;

class InventoryEquipmentController extends Controller
{
    public function index()
    {
        return InventoryEquipment::with(['product', 'purchaseOrderItem', 'status', 'creator', 'updater'])->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'purchase_order_item_id' => 'required|exists:purchase_order_items,id',
            'serial_number' => 'required',
            'model_number' => 'required',
            'purchase_date' => 'required|date',
            'status_id' => 'required|exists:statuses,id',
            'notes' => 'required',
            'created_by' => 'required|exists:users,id',
            'updated_by' => 'required|exists:users,id',
        ]);

        return InventoryEquipment::create($request->all());
    }

    public function show($id)
    {
        return InventoryEquipment::with(['product', 'purchaseOrderItem', 'status', 'creator', 'updater'])->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $inventoryEquipment = InventoryEquipment::findOrFail($id);

        $request->validate([
            'product_id' => 'sometimes|required|exists:products,id',
            'purchase_order_item_id' => 'sometimes|required|exists:purchase_order_items,id',
            'serial_number' => 'sometimes|required',
            'model_number' => 'sometimes|required',
            'purchase_date' => 'sometimes|required|date',
            'status_id' => 'sometimes|required|exists:statuses,id',
            'created_by' => 'sometimes|required|exists:users,id',
            'updated_by' => 'sometimes|required|exists:users,id',
        ]);

        $inventoryEquipment->update($request->all());

        return $inventoryEquipment;
    }

    public function destroy($id)
    {
        $inventoryEquipment = InventoryEquipment::findOrFail($id);
        $inventoryEquipment->delete();

        return response()->noContent();
    }
}
