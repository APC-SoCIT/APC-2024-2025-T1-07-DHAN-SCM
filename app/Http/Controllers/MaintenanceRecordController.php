<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Order;
use App\Models\Product;
use App\Models\DemoUnit;
use Illuminate\Http\Request;
use App\Models\IncomingStock;
use App\Models\OutgoingStock;
use App\Models\MaintenanceRecord;
use Illuminate\Support\Facades\DB;

class MaintenanceRecordController extends Controller
{


    public function forServicing()
    {
        return response()->json(
            collect(DB::select("
                SELECT 
                    F.name AS company_name,
                    B.name AS product_name,
                    ii.serial_number,
                    A.order_item_id,
                    A.demo_unit_id,
                    A.type,
                    A.incoming_stock_id,
                    ii.barcode,
                    COALESCE(D.megaion_order_number, E.demo_number) AS reference_number,
                    latest_maintenance.next_maintenance_date,
                    COALESCE(D.created_at, E.created_at) AS created_at,
                    latest_calibration.calibration_date
                FROM outgoing_stocks A
                INNER JOIN products B ON B.id = A.product_id
                INNER JOIN incoming_stocks ii ON ii.id = A.incoming_stock_id
                LEFT JOIN order_items C ON C.id = A.order_item_id
                LEFT JOIN orders D ON D.id = C.order_id
                LEFT JOIN demo_units E ON E.id = A.demo_unit_id
                LEFT JOIN companies F ON F.id = COALESCE(D.company_id, E.company_id)
                LEFT JOIN (
                    SELECT incoming_stock_id, next_maintenance_date 
                    FROM maintenance_records 
                    WHERE next_maintenance_date IS NOT NULL 
                    ORDER BY next_maintenance_date DESC
                ) latest_maintenance ON latest_maintenance.incoming_stock_id = A.incoming_stock_id
                LEFT JOIN (
                    SELECT incoming_stock_id, calibration_date 
                    FROM calibration_records 
                    WHERE calibration_date IS NOT NULL 
                    ORDER BY calibration_date DESC
                ) latest_calibration ON latest_calibration.incoming_stock_id = A.incoming_stock_id
                WHERE B.is_machine = 1 
                ORDER BY COALESCE(D.created_at, E.created_at) DESC;
            "))
            ->map(function ($item) {
                $today = now();
                $nextMaintenanceDate = $item->next_maintenance_date ? \Carbon\Carbon::parse($item->next_maintenance_date) : null;
                $calibrationDate = $item->calibration_date ? \Carbon\Carbon::parse($item->calibration_date) : null;
                
                return array_merge((array) $item, [
                    'for_maintenance' => $nextMaintenanceDate = null || $nextMaintenanceDate->diffInDays($today) <= 30,
                    'for_calibration' => $calibrationDate != null ? false : true
                ]);
            })
        );
    }
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