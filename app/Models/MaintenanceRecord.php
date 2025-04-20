<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MaintenanceRecord extends Model
{
    //
    protected $fillable = [
        'incoming_stock_id',
        'maintenance_date',
        'next_maintenance_date',
        'description',
        'performed_by',
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
