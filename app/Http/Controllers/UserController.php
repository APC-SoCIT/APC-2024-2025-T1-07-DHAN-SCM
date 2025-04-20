<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $roles = $user->roles->pluck('name'); // Assuming the Role model has a 'name' attribute
    
        return response()->json([
            'user_id' => $user->id,
            'name' => $user->full_name,
            'username' => $user->username,
            'email' => $user->email,
            'roles' => $roles
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'username' => 'required',
            'full_name' => 'required',
            'email' => 'required|email',
            'password' => 'required',
        ]);

        return User::create($request->all());
    }
  /*  public function getUserData(Request $request)
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
    }*/

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

        $request->validate([
            'username' => 'sometimes|required',
            'full_name' => 'sometimes|required',
            'email' => 'sometimes|required|email',
            'password' => 'sometimes|required',
        ]);

        $user->update($request->all());

        return $user;
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->noContent();
    }
}
