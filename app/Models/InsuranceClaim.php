<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InsuranceClaim extends Model
{
    //
    protected $fillable = [
        'incoming_stock_id',
        'claim_date',
        'incident_description',
        'claim_amount',
        'approved_amount',
        'claim_status_id',
        'insurer_name',
        'policy_number',
        'settlement_date',
        'remarks',
        'created_by',
        'updated_by',
    ];

    public function incomingStock()
    {
        return $this->belongsTo(IncomingStock::class);
    }


    public function claimStatus()
    {
        return $this->belongsTo(Status::class, 'claim_status_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
