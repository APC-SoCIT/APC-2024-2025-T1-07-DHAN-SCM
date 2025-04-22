<?php

namespace App\Http\Controllers;

use App\Models\DemoUnit;
use Illuminate\Http\Request;
use App\Models\IncomingStock;
use App\Models\OutgoingStock;
use Illuminate\Support\Facades\Auth;

class DemoUnitController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(
            DemoUnit::with([
                'incomingStock.product',
                'company',
                'assignedPerson',
                'status',
                'createdBy',
                'updatedBy'
            ])->get()->map(function ($demoUnit) {
                return array_merge($demoUnit->toArray(), [
                    'product' => optional($demoUnit->incomingStock->product)->toArray()
                ]);
            })
        );
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
    
        // ✅ Generate Next Demo Number
        $lastDemoUnit = DemoUnit::latest('id')->first(); // Get last entry
        $nextNumber = $lastDemoUnit ? ((int) substr($lastDemoUnit->demo_number, 5)) + 1 : 1; 
        $validatedData['demo_number'] = 'DEMO-' . str_pad($nextNumber, 6, '0', STR_PAD_LEFT); // Format DEMO-000001
    
        // ✅ Create Demo Unit
        $demoUnit = DemoUnit::create($validatedData);
    
        // ✅ Retrieve product ID from incoming stock
        $productId = IncomingStock::where('id', $validatedData['incoming_stock_id'])->value('product_id');
    
        // ✅ Automatically create an outgoing stock entry
        OutgoingStock::create([
            'demo_unit_id' => $demoUnit->id,
            'incoming_stock_id' => $validatedData['incoming_stock_id'],
            'order_item_id' => null,
            'product_id' => $productId,
            'type' => 'Demo',
            'remarks' => "",
        ]);
    
        // ✅ Retrieve product details
        $product = $demoUnit->incomingStock->product;
    
        return response()->json([
            'demo_unit' => $demoUnit,
            'product' => optional($product)->only([
                'id', 'name', 'sku', 'model', 'description', 'image_url', 'minimum_quantity',
                'supplier_price', 'created_at', 'updated_at'
            ]) + [
                'supplier' => optional($product->supplier)->name,
                'location' => optional($product->location)->name,
                'warehouse' => optional($product->warehouse)->name,
                'status' => optional($product->status)->name,
                'created_by' => optional($product->creator)->name,
                'updated_by' => optional($product->updater)->name,
                'tags' => optional($product->tags)->pluck('name')->toArray(),
            ],
        ], 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, DemoUnit $demoUnit)
    {
        $validatedData = $request->validate([
            'demo_start' => 'date',
            'demo_end' => 'nullable|date',
            'assigned_person_id' => 'exists:users,id',
            'notes' => 'nullable|string',
        ]);

        $validatedData['updated_by'] = auth()->id();

        // ✅ Update only selected fields without modifying `demo_number`
        $demoUnit->update($validatedData);

        // ✅ Retrieve product details safely
        $product = optional($demoUnit->incomingStock->product);

        return response()->json([
            'demo_unit' => $demoUnit,
            'product' => optional($product)->only([
                'id', 'name', 'sku', 'model', 'description', 'image_url', 'minimum_quantity',
                'supplier_price', 'created_at', 'updated_at'
            ]) + [
                'supplier' => optional($product->supplier)->name,
                'location' => optional($product->location)->name,
                'warehouse' => optional($product->warehouse)->name,
                'status' => optional($product->status)->name,
                'created_by' => optional($product->creator)->name,
                'updated_by' => optional($product->updater)->name,
                'tags' => optional($product->tags)->pluck('name')->toArray(),
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