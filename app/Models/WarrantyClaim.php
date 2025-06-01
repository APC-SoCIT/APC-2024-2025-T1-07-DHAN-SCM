<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WarrantyClaim extends Model
{
    use HasFactory;

    protected $fillable = [
        'incoming_stock_id',
        'claim_date',
        'description',
        'performed_by',
        'created_by',
        'updated_by',
    ];

    public function incomingStock()
    {
        return $this->belongsTo(IncomingStock::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}