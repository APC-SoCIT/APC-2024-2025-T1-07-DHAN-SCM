<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\IncomingStock;
use App\Models\MaintenanceRecord;

class MaintenanceRecordController extends Controller
{
    // Retrieve all maintenance records with related entities
    public function index()
    {
        return MaintenanceRecord::with(['createdBy', 'updatedBy'])->get();
    }

    // Store a new maintenance record using serial number
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
        return MaintenanceRecord::create($validatedData);
    }

    // Retrieve maintenance records by serial number instead of ID
    public function show($serialNumber)
    {
        $incomingStock = IncomingStock::where('serial_number', $serialNumber)->first();

        if (!$incomingStock) {
            return response()->json(['error' => 'No stock found for the provided serial number'], 404);
        }

        return MaintenanceRecord::with(['createdBy', 'updatedBy'])
            ->where('incoming_stock_id', $incomingStock->id)
            ->orderBy('maintenance_date', 'desc') // Sort by maintenance_date in descending order
            ->get();
    }

    // Update an existing maintenance record using serial number
    public function update(Request $request, $id)
    {
        $maintenanceRecord = MaintenanceRecord::findOrFail($id);
    
        $request->validate([
            'maintenance_date' => 'required|date',
            'next_maintenance_date' => 'required|date',
            'description' => 'required',
            'performed_by' => 'required',
        ]);
    
        // Prepare the data for updating
        $validatedData = $request->all();
        $validatedData['updated_by'] = auth()->id(); // Track updater
    
        // Update the maintenance record
        $maintenanceRecord->update($validatedData);
    
        return $maintenanceRecord;
    }

    // Delete a specific maintenance record by ID
    public function destroy($id)
    {
        $maintenanceRecord = MaintenanceRecord::findOrFail($id);
        $maintenanceRecord->delete();

        return response()->noContent();
    }
}