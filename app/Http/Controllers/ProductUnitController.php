<?php

namespace App\Http\Controllers;

use App\Models\ProductUnit;
use Illuminate\Http\Request;

class ProductUnitController extends Controller
{
    // Retrieve all product units
    public function index()
    {
        return ProductUnit::all();
    }

    // Store a new product unit
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255|unique:product_units,name',
            'abbreviation' => 'nullable|string|max:50',
            'description' => 'nullable|string',
        ]);

        $productUnit = ProductUnit::create($validatedData);

        return response()->json([
            'message' => 'Product unit successfully created',
            'productUnit' => $productUnit
        ], 201);
    }

    // Show a specific product unit
    public function show($id)
    {
        return ProductUnit::findOrFail($id);
    }

    // Update an existing product unit
    public function update(Request $request, $id)
    {
        $productUnit = ProductUnit::findOrFail($id);

        $validatedData = $request->validate([
            'name' => 'sometimes|required|string|max:255|unique:product_units,name,' . $id,
            'abbreviation' => 'nullable|string|max:50',
            'description' => 'nullable|string',
        ]);

        $productUnit->update($validatedData);

        return response()->json([
            'message' => 'Product unit successfully updated',
            'productUnit' => $productUnit
        ]);
    }

    // Delete a product unit
    public function destroy($id)
    {
        $productUnit = ProductUnit::findOrFail($id);
        $productUnit->delete();

        return response()->noContent();
    }
}