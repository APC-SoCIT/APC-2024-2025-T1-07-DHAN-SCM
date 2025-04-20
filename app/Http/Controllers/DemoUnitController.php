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
        return response()->json(DemoUnit::with(['incomingStock', 'company', 'assignedPerson', 'status', 'createdBy', 'updatedBy'])->get());
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
            'status_id' => 'required|exists:statuses,id', // ✅ Changed to reference statuses table
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

        return response()->json($demoUnit, 201);
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
            'status_id' => 'exists:statuses,id', // ✅ Changed to reference statuses table
            'notes' => 'nullable|string',
        ]);

        $validatedData['updated_by'] = auth()->id();

        $demoUnit->update($validatedData);

        return response()->json($demoUnit);
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