<?php

namespace App\Http\Controllers;

use App\Models\PurchaseOrderItem;
use Illuminate\Http\Request;

class PurchaseOrderItemController extends Controller
{
    public function index()
    {
        return PurchaseOrderItem::with(['purchaseOrder', 'product', 'creator', 'updater'])->get();
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'purchase_order_id' => 'required|exists:purchase_orders,id',
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|numeric',
            'unit_price' => 'required|numeric',
            'total_price' => 'required|numeric',
        ]);

        // Set created_by and updated_by dynamically from authentication
        $validatedData['created_by'] = auth()->id();
        $validatedData['updated_by'] = auth()->id();

        return PurchaseOrderItem::create($validatedData);
    }
    public function show($id)
    {
        return PurchaseOrderItem::with(['purchaseOrder', 'product', 'creator', 'updater'])->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $purchaseOrderItem = PurchaseOrderItem::findOrFail($id);
    
        $validatedData = $request->validate([
            'purchase_order_id' => 'sometimes|required|exists:purchase_orders,id',
            'product_id' => 'sometimes|required|exists:products,id',
            'quantity' => 'sometimes|required|numeric',
            'unit_price' => 'sometimes|required|numeric',
            'total_price' => 'sometimes|required|numeric',
        ]);
    
        // Set updated_by to the authenticated user
        $validatedData['updated_by'] = auth()->id();
    
        // Update the record
        $purchaseOrderItem->update($validatedData);
    
        return response()->json([
            'message' => 'Purchase order item updated successfully',
            'data' => $purchaseOrderItem
        ]);
    }

    public function destroy($id)
    {
        $purchaseOrderItem = PurchaseOrderItem::findOrFail($id);
        $purchaseOrderItem->delete();

        return response()->noContent();
    }
}
