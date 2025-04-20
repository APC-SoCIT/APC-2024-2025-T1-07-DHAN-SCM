<?php

namespace App\Http\Controllers;

use App\Models\RoleUser;
use Illuminate\Http\Request;

class RoleUserController extends Controller
{
    public function index()
    {
        return RoleUser::with(['user', 'role'])->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'role_id' => 'required|exists:roles,id',
            'created_at' => 'required|date',
            'updated_at' => 'required|date',
        ]);

        return RoleUser::create($request->all());
    }

    public function show($id)
    {
        return RoleUser::with(['user', 'role'])->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $roleUser = RoleUser::findOrFail($id);

        $request->validate([
            'user_id' => 'sometimes|required|exists:users,id',
            'role_id' => 'sometimes|required|exists:roles,id',
            'created_at' => 'sometimes|required|date',
            'updated_at' => 'sometimes|required|date',
        ]);

        $roleUser->update($request->all());

        return $roleUser;
    }

    public function destroy($id)
    {
        $roleUser = RoleUser::findOrFail($id);
        $roleUser->delete();

        return response()->noContent();
    }
}
