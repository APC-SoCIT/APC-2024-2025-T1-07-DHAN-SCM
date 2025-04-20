<?php

namespace App\Http\Controllers;

use App\Models\DemoUnit;
use Illuminate\Http\Request;
use App\Models\OutgoingStock;
use Illuminate\Support\Facades\Auth;

class DemoUnitController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $demoUnits = DemoUnit::with(['incomingStock.product', 'company', 'assignedPerson', 'status', 'createdBy', 'updatedBy'])->get()->map(function ($demoUnit) {
            return [
                'demo_unit_id' => $demoUnit->id,
                'incoming_stock_id' => $demoUnit->incoming_stock_id,
                'company' => $demoUnit->company->name ?? null,
                'assigned_person' => $demoUnit->assignedPerson->name ?? null,
                'status' => $demoUnit->status->name ?? null,
                'created_by' => $demoUnit->createdBy->name ?? null,
                'updated_by' => $demoUnit->updatedBy->name ?? null,
                'demo_start' => $demoUnit->demo_start,
                'demo_end' => $demoUnit->demo_end,
                'notes' => $demoUnit->notes,
                'product' => $demoUnit->incomingStock->product ? [
                    'product_id' => $demoUnit->incomingStock->product->id,
                    'name' => $demoUnit->incomingStock->product->name,
                    'sku' => $demoUnit->incomingStock->product->sku,
                    'model' => $demoUnit->incomingStock->product->model,
                    'description' => $demoUnit->incomingStock->product->description,
                    'image_url' => $demoUnit->incomingStock->product->image_url,
                    'minimum_quantity' => $demoUnit->incomingStock->product->minimum_quantity,
                    'supplier' => $demoUnit->incomingStock->product->supplier->name ?? null,
                    'supplier_price' => $demoUnit->incomingStock->product->supplier_price,
                    'location' => $demoUnit->incomingStock->product->location->name ?? null,
                    'warehouse' => $demoUnit->incomingStock->product->warehouse->name ?? null,
                    'status' => $demoUnit->incomingStock->product->status->name ?? null,
                    'created_by' => $demoUnit->incomingStock->product->creator->name ?? null,
                    'updated_by' => $demoUnit->incomingStock->product->updater->name ?? null,
                    'tags' => $demoUnit->incomingStock->product->tags->pluck('name')->toArray(),
                ] : null,
            ];
        });
    
        return response()->json(['demo_units' => $demoUnits]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'incoming_stock_id' => 'required|exists:incoming_stocks,id',
            'company_id' => 'required|exists:companies,id',
            'demo_start' => 'required|date',
            'demo_end' => 'nullable|date',
            'assigned_person_id' => 'required|exists:users,id',
            'status_id' => 'required|exists:statuses,id',
            'notes' => 'nullable|string',
        ]);
    
        $validatedData['created_by'] = auth()->id();
    
        // ✅ Create Demo Unit
        $demoUnit = DemoUnit::create($validatedData);
    
        // ✅ Automatically create an outgoing stock entry
        OutgoingStock::create([
            'demo_unit_id' => $demoUnit->id,
            'incoming_stock_id' => $validatedData['incoming_stock_id'],
            'order_item_id' => null, // Set if applicable
            'type' => 'Demo',
            'remarks' => "",
        ]);
    
        // ✅ Retrieve product details through incoming stock
        $product = IncomingStock::find($validatedData['incoming_stock_id'])->product;
    
        return response()->json([
            'demo_unit' => $demoUnit,
            'product' => [
                'product_id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'model' => $product->model,
                'description' => $product->description,
                'image_url' => $product->image_url,
                'minimum_quantity' => $product->minimum_quantity,
                'supplier' => $product->supplier->name ?? null,
                'supplier_price' => $product->supplier_price,
                'location' => $product->location->name ?? null,
                'warehouse' => $product->warehouse->name ?? null,
                'status' => $product->status->name ?? null,
                'created_by' => $product->creator->name ?? null,
                'updated_by' => $product->updater->name ?? null,
                'tags' => $product->tags->pluck('name')->toArray(),
                'available_quantity' => $product->incomingStocks->sum('quantity'),
            ],
        ], 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, DemoUnit $demoUnit)
    {
        $validatedData = $request->validate([
            'incoming_stock_id' => 'exists:incoming_stocks,id',
            'company_id' => 'exists:companies,id',
            'demo_start' => 'date',
            'demo_end' => 'nullable|date',
            'assigned_person_id' => 'exists:users,id',
            'status_id' => 'exists:statuses,id',
            'notes' => 'nullable|string',
        ]);
    
        $validatedData['updated_by'] = auth()->id();
    
        $demoUnit->update($validatedData);
    
        // ✅ Retrieve product details through the incoming stock
        $product = $demoUnit->incomingStock->product;
    
        return response()->json([
            'demo_unit' => $demoUnit,
            'product' => [
                'product_id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'model' => $product->model,
                'description' => $product->description,
                'image_url' => $product->image_url,
                'minimum_quantity' => $product->minimum_quantity,
                'supplier' => $product->supplier->name ?? null,
                'supplier_price' => $product->supplier_price,
                'location' => $product->location->name ?? null,
                'warehouse' => $product->warehouse->name ?? null,
                'status' => $product->status->name ?? null,
                'created_by' => $product->creator->name ?? null,
                'updated_by' => $product->updater->name ?? null,
                'tags' => $product->tags->pluck('name')->toArray(),
                'available_quantity' => $product->incomingStocks->sum('quantity'),
            ],
        ]);
    }
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(DemoUnit $demoUnit)
    {
        $demoUnit->delete();

        return response()->json(['message' => 'Deleted successfully']);
    }
}