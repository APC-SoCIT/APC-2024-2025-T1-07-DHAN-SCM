<?php

namespace App\Http\Controllers;

use App\Models\Location;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    // Retrieve all locations with related entities
    public function index()
    {
        return Location::with(['creator', 'updater'])->get();
    }

    // Store a new location
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
        ]);

        // Assign created_by and updated_by based on logged-in user
        $validatedData['created_by'] = auth()->id();
        $validatedData['updated_by'] = auth()->id();

        return Location::create($validatedData);
    }

    // Retrieve a specific location by ID
    public function show($id)
    {
        return Location::with(['creator', 'updater'])->findOrFail($id);
    }

    // Update an existing location
    public function update(Request $request, $id)
    {
        $location = Location::findOrFail($id);

        $validatedData = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
        ]);

        // Automatically update 'updated_by' with the logged-in user ID
        $validatedData['updated_by'] = auth()->id();

        $location->update($validatedData);

        return response()->json([
            'message' => 'Location successfully updated',
            'location' => $location
        ]);
    }

    // Delete a specific location by ID
    public function destroy($id)
    {
        $location = Location::findOrFail($id);
        $location->delete();

        return response()->noContent();
    }
}