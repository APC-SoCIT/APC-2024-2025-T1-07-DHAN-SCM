<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentTransaction extends Model
{
    //
    protected $fillable = [
        'billing_id',
        'payment_date',
        'amount_paid',
        'payment_method',
        'is_pdc',
        'cheque_clearance_date',
        'created_by',
        'updated_by',
    ];

    public function billing()
    {
        return $this->belongsTo(Billing::class);
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
