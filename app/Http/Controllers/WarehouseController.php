<?php

namespace App\Http\Controllers;

use App\Models\Warehouse;
use Illuminate\Http\Request;

class WarehouseController extends Controller
{
    // Retrieve all warehouses with related entities
    public function index()
    {
        return Warehouse::with(['creator', 'updater'])->get();
    }

    // Store a new warehouse
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string',
        ]);

        // Assign created_by and updated_by based on logged-in user
        $validatedData['created_by'] = auth()->id();
        $validatedData['updated_by'] = auth()->id();

        return Warehouse::create($validatedData);
    }

    // Retrieve a specific warehouse by ID
    public function show($id)
    {
        return Warehouse::with(['creator', 'updater'])->findOrFail($id);
    }

    // Update an existing warehouse
    public function update(Request $request, $id)
    {
        $warehouse = Warehouse::findOrFail($id);

        $validatedData = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'address' => 'sometimes|required|string',
        ]);

        // Automatically update 'updated_by' with the logged-in user ID
        $validatedData['updated_by'] = auth()->id();

        $warehouse->update($validatedData);

        return response()->json([
            'message' => 'Warehouse successfully updated',
            'warehouse' => $warehouse
        ]);
    }

    // Delete a specific warehouse by ID
    public function destroy($id)
    {
        $warehouse = Warehouse::findOrFail($id);
        $warehouse->delete();

        return response()->noContent();
    }
}