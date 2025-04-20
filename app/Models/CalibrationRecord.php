<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CalibrationRecord extends Model
{
    //
    protected $fillable = [
        'incoming_stock_id',
        'calibration_date',
        'calibrated_by',
        'calibration_notes',
        'created_by',
        'updated_by',
    ];

    public function incomingStock()
    {
        return $this->belongsTo(IncomingStock::class);
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
