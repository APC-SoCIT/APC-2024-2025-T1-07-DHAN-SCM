<?php

namespace App\Http\Controllers;

use App\Models\InsuranceClaim;
use Illuminate\Http\Request;

class InsuranceClaimController extends Controller
{
    public function index()
    {
        return InsuranceClaim::with(['inventoryEquipment', 'claimStatus', 'createdBy', 'updatedBy'])->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'inventory_equipment_id' => 'required|exists:inventory_equipments,id',
            'claim_date' => 'required|date',
            'incident_description' => 'required',
            'claim_amount' => 'required|numeric',
            'approved_amount' => 'required|numeric',
            'claim_status_id' => 'required|exists:statuses,id',
            'insurer_name' => 'required',
            'policy_number' => 'required',
            'settlement_date' => 'required|date',
            'remarks' => 'required',
            'created_by' => 'required|exists:users,id',
            'updated_by' => 'required|exists:users,id',
        ]);

        return InsuranceClaim::create($request->all());
    }

    public function show($id)
    {
        return InsuranceClaim::with(['inventoryEquipment', 'claimStatus', 'createdBy', 'updatedBy'])->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $insuranceClaim = InsuranceClaim::findOrFail($id);

        $request->validate([
            'inventory_equipment_id' => 'sometimes|required|exists:inventory_equipments,id',
            'claim_date' => 'sometimes|required|date',
            'incident_description' => 'sometimes|required',
            'claim_amount' => 'sometimes|required|numeric',
            'approved_amount' => 'sometimes|required|numeric',
            'claim_status_id' => 'sometimes|required|exists:statuses,id',
            'insurer_name' => 'sometimes|required',
            'policy_number' => 'sometimes|required',
            'settlement_date' => 'sometimes|required|date',
            'remarks' => 'sometimes|required',
            'created_by' => 'sometimes|required|exists:users,id',
            'updated_by' => 'sometimes|required|exists:users,id',
        ]);

        $insuranceClaim->update($request->all());

        return $insuranceClaim;
    }

    public function destroy($id)
    {
        $insuranceClaim = InsuranceClaim::findOrFail($id);
        $insuranceClaim->delete();

        return response()->noContent();
    }
}
