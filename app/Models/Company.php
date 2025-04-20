<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    protected $fillable = [
        'name', 'contact_info', 'website_url', 'industry', 'address',
        'city', 'country', 'zip_code', 'phone_number', 'email_address',
        'primary_contact_name', 'primary_contact_phone', 'primary_contact_email',
        'additional_info', 'created_by', 'updated_by'
    ];
    
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // Add relationship to company_users table
    public function companyUsers()
    {
        return $this->hasMany(CompanyUser::class);
    }
}