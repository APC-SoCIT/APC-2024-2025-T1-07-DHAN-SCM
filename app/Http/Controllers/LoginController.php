<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class LoginController extends Controller
{
    //
    public function login(Request $request)
    {
        // Validate the request
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);
    
        // Attempt authentication using 'username' instead of 'email'
        if (Auth::attempt(['username' => $request->username, 'password' => $request->password])) {
            $user = Auth::user();
            $token = $user->createToken('API Token')->plainTextToken;
    
            // Retrieve user roles from the pivot table
            $roles = $user->roles()->pluck('name'); // Assuming Role model has a 'name' field
    
            return response()->json([
                'name' => $user->full_name,
                'username' => $user->username,
                'token' => $token,
                'user_id' => $user->id,
                'roles' => $roles,
            ]);
        }
    
        return response()->json(['message' => 'Invalid credentials'], 401);
    }
    
    public function logout(Request $request) {
        // Revoke the token that was used to authenticate the current request...
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Successfully logged out'
        ]);
    }
}
