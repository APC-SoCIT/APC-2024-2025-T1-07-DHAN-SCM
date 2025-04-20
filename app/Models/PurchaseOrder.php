<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PurchaseOrder extends Model
{
    protected $fillable = [
        'supplier_id', 
        'order_date', 
        'total_amount', 
        'status_id', 
        'created_by', 
        'updated_by',
        'ponumber' // Ensure this field is fillable
    ];

    // Auto-generate PO number when a new record is created
    protected static function boot()
    {
        parent::boot();
    
        static::creating(function ($purchaseOrder) {
            // Temporarily set PO number based on provided type
            if ($purchaseOrder->ponumber === "Normal") {
                $purchaseOrder->ponumber = 'N-TEMP';
            } else {
                $purchaseOrder->ponumber = 'I-TEMP';
            }
        });
    
        static::created(function ($purchaseOrder) {
            // Determine prefix based on temporary value
            $prefix = ($purchaseOrder->ponumber === 'N-TEMP') ? 'N-' : 'I-';
    
            // Generate final PO number based on ID
            $purchaseOrder->ponumber = $prefix . 'P' . str_pad($purchaseOrder->id, 6, '0', STR_PAD_LEFT);
            $purchaseOrder->save();
        });
    }

    // Relationship with the Supplier model
    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    // Relationship with the Status model
    public function status()
    {
        return $this->belongsTo(Status::class);
    }

    // Relationship with the User model (creator)
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Relationship with the User model (updater)
    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // Relationship with PurchaseOrderItem model
    public function items()
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }
}