<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use Illuminate\Http\Request;

class TagController extends Controller
{
    // Retrieve all tags
    public function index()
{
    return Tag::all();
}

    // Store a new tag
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255|unique:tags,name',
        ]);

        $tag = Tag::create($validatedData);

        return response()->json([
            'message' => 'Tag successfully created',
            'tag' => $tag
        ], 201);
    }

    // Show a specific tag
    public function show($id)
    {
        return Tag::findOrFail($id);
    }
    // Update an existing tag
    public function update(Request $request, $id)
    {
        $tag = Tag::findOrFail($id);

        $validatedData = $request->validate([
            'name' => 'sometimes|required|string|max:255|unique:tags,name,' . $id,
        ]);

        $tag->update($validatedData);

        return response()->json([
            'message' => 'Tag successfully updated',
            'tag' => $tag
        ]);
    }

    // Delete a tag
    public function destroy($id)
    {
        $tag = Tag::findOrFail($id);
        $tag->delete();

        return response()->noContent();
    }
}