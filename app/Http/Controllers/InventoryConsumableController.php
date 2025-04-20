<?php

namespace App\Http\Controllers;

use App\Models\InventoryConsumable;
use Illuminate\Http\Request;

class InventoryConsumableController extends Controller
{
    public function index()
    {
        return InventoryConsumable::with(['product', 'purchaseOrderItem',  'creator', 'updater'])->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'purchase_order_item_id' => 'required|exists:purchase_order_items,id',
            'lot_number' => 'required',
            'expiry_date' => 'required|date',
            'quantity' => 'required|numeric',
            'notes' => 'required',
            'created_by' => 'required|exists:users,id',
            'updated_by' => 'required|exists:users,id',
        ]);

        return InventoryConsumable::create($request->all());
    }

    public function show($id)
    {
        return InventoryConsumable::with(['product', 'purchaseOrderItem', 'creator', 'updater'])->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $inventoryConsumable = InventoryConsumable::findOrFail($id);

        $request->validate([
            'product_id' => 'sometimes|required|exists:products,id',
            'purchase_order_item_id' => 'sometimes|required|exists:purchase_order_items,id',
            'lot_number' => 'sometimes|required',
            'expiry_date' => 'sometimes|required|date',
            'quantity' => 'sometimes|required|numeric',
            'created_by' => 'sometimes|required|exists:users,id',
            'updated_by' => 'sometimes|required|exists:users,id',
        ]);

        $inventoryConsumable->update($request->all());

        return $inventoryConsumable;
    }

    public function destroy($id)
    {
        $inventoryConsumable = InventoryConsumable::findOrFail($id);
        $inventoryConsumable->delete();

        return response()->noContent();
    }
}
