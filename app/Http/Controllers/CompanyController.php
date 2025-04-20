<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\CompanyUser;
use Illuminate\Http\Request;

class CompanyController extends Controller
{
    public function index()
    {
        return Company::with('companyUsers.user')->get()->map(function ($company) {
            return [
                "name" => $company->name,
                "contact_info" => $company->contact_info,
                "website_url" => $company->website_url,
                "industry" => $company->industry,
                "address" => $company->address,
                "city" => $company->city,
                "country" => $company->country,
                "zip_code" => $company->zip_code,
                "phone_number" => $company->phone_number,
                "email_address" => $company->email_address,
                "primary_contact_name" => $company->primary_contact_name,
                "primary_contact_phone" => $company->primary_contact_phone,
                "primary_contact_email" => $company->primary_contact_email,
                "additional_info" => $company->additional_info,
                "created_by" => $company->created_by,
                "updated_by" => $company->updated_by,
                "user_id" => $company->companyUsers->pluck('user_id')->toArray(),
                "users" => $company->companyUsers->pluck('user')->toArray(),
            ];
        });
    }
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string',
            'contact_info' => 'nullable|string',
            'website_url' => 'nullable|url',
            'industry' => 'nullable|string',
            'address' => 'nullable|string',
            'city' => 'nullable|string',
            'country' => 'nullable|string',
            'zip_code' => 'nullable|string',
            'phone_number' => 'nullable|string',
            'email_address' => 'nullable|email',
            'primary_contact_name' => 'nullable|string',
            'primary_contact_phone' => 'nullable|string',
            'primary_contact_email' => 'nullable|email',
            'additional_info' => 'nullable|json',
            'created_by' => 'nullable|exists:users,id',
            'updated_by' => 'nullable|exists:users,id',
            'user_id' => 'nullable|array', // Now optional
            'user_id.*' => 'exists:users,id' // Ensures valid user IDs if provided
        ]);
    
        $company = Company::create($validatedData);
    
        // Attach users only if user_id is provided and not empty
        if (!empty($validatedData['user_id'])) {
            foreach ($validatedData['user_id'] as $userId) {
                CompanyUser::create([
                    'company_id' => $company->id,
                    'user_id' => $userId
                ]);
            }
        }
    
        return $company;
    }

    
    public function show($id)
    {
        $company = Company::with('companyUsers.user')->findOrFail($id);
    
        return [
            "name" => $company->name,
            "contact_info" => $company->contact_info,
            "website_url" => $company->website_url,
            "industry" => $company->industry,
            "address" => $company->address,
            "city" => $company->city,
            "country" => $company->country,
            "zip_code" => $company->zip_code,
            "phone_number" => $company->phone_number,
            "email_address" => $company->email_address,
            "primary_contact_name" => $company->primary_contact_name,
            "primary_contact_phone" => $company->primary_contact_phone,
            "primary_contact_email" => $company->primary_contact_email,
            "additional_info" => $company->additional_info,
            "created_by" => $company->created_by,
            "updated_by" => $company->updated_by,
            "user_id" => $company->companyUsers->pluck('user_id')->toArray(),
            "users" => $company->companyUsers->pluck('user')->toArray(),
        ];
    }

    public function update(Request $request, $id)
    {
        $company = Company::findOrFail($id);
    
        $validatedData = $request->validate([
            'name' => 'nullable|string',
            'contact_info' => 'nullable|string',
            'website_url' => 'nullable|url',
            'industry' => 'nullable|string',
            'address' => 'nullable|string',
            'city' => 'nullable|string',
            'country' => 'nullable|string',
            'zip_code' => 'nullable|string',
            'phone_number' => 'nullable|string',
            'email_address' => 'nullable|email',
            'primary_contact_name' => 'nullable|string',
            'primary_contact_phone' => 'nullable|string',
            'primary_contact_email' => 'nullable|email',
            'additional_info' => 'nullable|json',
            'created_by' => 'nullable|exists:users,id',
            'updated_by' => 'nullable|exists:users,id',
            'user_id' => 'nullable|array', // Now optional
            'user_id.*' => 'exists:users,id' // Ensures valid user IDs if provided
        ]);
    
        $company->update($validatedData);
    
        // Only update `company_users` if `user_id` is provided
        if (isset($validatedData['user_id'])) {
            CompanyUser::where('company_id', $company->id)->delete();
    
            foreach ($validatedData['user_id'] as $userId) {
                CompanyUser::create([
                    'company_id' => $company->id,
                    'user_id' => $userId
                ]);
            }
        }
    
        return $company;
    }


    public function destroy($id)
    {
        Company::findOrFail($id)->delete();

        return response()->noContent();
    }
}