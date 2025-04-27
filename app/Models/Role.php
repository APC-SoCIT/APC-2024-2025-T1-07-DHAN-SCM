<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    protected $fillable = ['name', 'description'];

    public function roleUsers()
    {
        return $this->hasMany(RoleUser::class); // ✅ Correct model reference
    }
    // Relationship with User model through UserRole
    public function users()
    {
        return $this->belongsToMany(User::class, 'role_users', 'role_id', 'user_id');
    }

}


