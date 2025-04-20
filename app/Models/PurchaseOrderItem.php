<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PurchaseOrderItem extends Model
{
    protected $fillable = [
        'purchase_order_id', 
        'product_id', 
        'quantity', 
        'unit_price', 
        'total_price', 
        'created_by', 
        'updated_by'
    ];

    // Relationship with the PurchaseOrder model
    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    // Relationship with the Product model
    public function product()
    {
        return $this->belongsTo(Product::class);
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

    // Relationship with the PurchaseOrderItemDelivery model
    public function deliveries()
    {
        return $this->hasMany(PurchaseOrderItemDelivery::class);
    }
}
