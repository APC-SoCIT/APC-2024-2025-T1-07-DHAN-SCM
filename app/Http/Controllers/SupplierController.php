<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    // Retrieve all suppliers with related entities
    public function index()
    {
        return Supplier::with(['creator', 'updater'])->get();
    }

    // Store a new supplier
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'contact_info' => 'required|string',
        ]);

        // Assign created_by and updated_by based on logged-in user
        $validatedData['created_by'] = auth()->id();
        $validatedData['updated_by'] = auth()->id();

        return Supplier::create($validatedData);
    }

    // Retrieve a specific supplier by ID
    public function show($id)
    {
        return Supplier::with(['creator', 'updater'])->findOrFail($id);
    }

    // Update an existing supplier
    public function update(Request $request, $id)
    {
        $supplier = Supplier::findOrFail($id);

        $validatedData = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'contact_info' => 'sometimes|required|string',
        ]);

        // Automatically update 'updated_by' with the logged-in user ID
        $validatedData['updated_by'] = auth()->id();

        $supplier->update($validatedData);

        return response()->json([
            'message' => 'Supplier successfully updated',
            'supplier' => $supplier
        ]);
    }

    // Delete a specific supplier by ID
    public function destroy($id)
    {
        $supplier = Supplier::findOrFail($id);
        $supplier->delete();

        return response()->noContent();
    }
}