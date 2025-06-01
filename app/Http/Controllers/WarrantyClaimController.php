<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\IncomingStock;
use App\Models\WarrantyClaim;

class WarrantyClaimController extends Controller
{
    public function index()
    {
        return response()->json(WarrantyClaim::all());
    }

    public function create()
    {
        // Not needed for API controllers
    }

    public function store(Request $request)
{
    $request->validate([
        'serial_number' => 'required|exists:incoming_stocks,serial_number', // Validate using serial number
        'maintenance_date' => 'required|date',
        'next_maintenance_date' => 'required|date',
        'description' => 'required',
        'performed_by' => 'required',
    ]);

    // Retrieve incoming_stock_id using the serial number
    $incomingStock = IncomingStock::where('serial_number', $request->serial_number)->first();

    if (!$incomingStock) {
        return response()->json(['error' => 'No stock found for the provided serial number'], 404);
    }

    // Prepare the data
    $validatedData = $request->all();
    $validatedData['incoming_stock_id'] = $incomingStock->id;
    $validatedData['created_by'] = auth()->id();
    $validatedData['updated_by'] = auth()->id();

    // Create the maintenance record
    $maintenanceRecord = MaintenanceRecord::create($validatedData);

    return response()->json($maintenanceRecord, 201);
}

    public function show($serialNumber)
    {
        $incomingStock = IncomingStock::where('serial_number', $serialNumber)->first();
    
        if (!$incomingStock) {
            return response()->json(['error' => 'No stock found for the provided serial number'], 404);
        }
    
        return WarrantyClaim::with(['creator', 'updater']) // Adjusted relationships
            ->where('incoming_stock_id', $incomingStock->id)
            ->orderBy('claim_date', 'desc') // Sorted by claim_date instead of maintenance_date
            ->get();
    }
    public function edit(WarrantyClaim $warrantyClaim)
    {
        // Not needed for API controllers
    }

    public function update(Request $request, $id)
    {
        $warrantyClaim = WarrantyClaim::findOrFail($id);
    
        $request->validate([
            'incoming_stock_id' => 'required|exists:incoming_stocks,id',
            'claim_date' => 'required|date',
            'description' => 'nullable|string',
            'performed_by' => 'nullable|string',
        ]);
    
        // Prepare the data for updating
        $validatedData = $request->all();
        $validatedData['updated_by'] = auth()->id(); // Track updater
    
        // Update the warranty claim
        $warrantyClaim->update($validatedData);
    
        return response()->json($warrantyClaim);
    }

    public function destroy(WarrantyClaim $warrantyClaim)
    {
        $warrantyClaim->delete();
        return response()->json(['message' => 'Warranty claim deleted successfully']);
    }
}