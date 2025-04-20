<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DemoUnit extends Model
{
    use HasFactory;

    protected $table = 'demo_units';

    protected $fillable = [
        'incoming_stock_id',
        'company_id',
        'demo_start',
        'demo_end',
        'assigned_person_id',
        'status_id', // ✅ Updated to reference statuses table
        'notes',
        'created_by',
        'updated_by',
    ];

    // ✅ Relationships
    public function incomingStock(): BelongsTo
    {
        return $this->belongsTo(IncomingStock::class, 'incoming_stock_id');
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id');
    }

    public function assignedPerson(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_person_id');
    }

    public function status(): BelongsTo
    {
        return $this->belongsTo(Status::class, 'status_id'); // ✅ Added relationship for statuses
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}