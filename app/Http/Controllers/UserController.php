<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\RoleUser;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        return User::with('roles')->get();
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'username' => 'required|string|unique:users,username',
            'full_name' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:1',
            'roles' => 'nullable|array', // Ensure roles is an array if provided
            'roles.*' => 'exists:roles,id', // Validate each role ID exists
        ]);

        // Create user
        $user = User::create([
            'username' => $validatedData['username'],
            'full_name' => $validatedData['full_name'],
            'email' => $validatedData['email'],
            'password' => bcrypt($validatedData['password']), // Secure password
        ]);

        // Attach roles if provided
        if (!empty($validatedData['roles'])) {
            foreach ($validatedData['roles'] as $roleId) {
                RoleUser::create([
                    'user_id' => $user->id,
                    'role_id' => $roleId
                ]);
            }
        }

        return response()->json($user, 201);
    }


   public function getUserData(Request $request)
    {
        $user = auth()->user();
        $roles = $user->roles->pluck('name');// Assuming the Role model has a 'name' attribute
        return response()->json([
            'user_id' => $user->id,
            'name' => $user->full_name,
            'username' => $user->username,
            'email' => $user->email,
            'roles' => $roles
        ]);
    }

    public function show($id)
    {
        $user = User::with('roles')->findOrFail($id);
    
        return response()->json([
            'user_id' => $user->id,
            'name' => $user->full_name,
            'username' => $user->username,
            'email' => $user->email,
            'roles' => $user->roles->pluck('name') // Extract only role names
        ]);
    }


    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validatedData = $request->validate([
            'username' => 'sometimes|required|string|unique:users,username,' . $id,
            'full_name' => 'sometimes|required|string',
            'email' => 'sometimes|required|email|unique:users,email,' . $id,
            'password' => 'sometimes|required|string|min:1',
            'roles' => 'nullable|array', // Ensure roles is an array if provided
            'roles.*' => 'exists:roles,id', // Validate each role ID exists
        ]);

        // Update user details
        if (!empty($validatedData['password'])) {
            $validatedData['password'] = bcrypt($validatedData['password']); // Secure password update
        }
        $user->update($validatedData);

        // **Handling Roles**
        if (array_key_exists('roles', $validatedData)) {
            $user->roles()->sync($validatedData['roles'] ?? []); // Sync, removing all roles if empty array is provided
        }

        return response()->json($user);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->noContent();
    }
}
