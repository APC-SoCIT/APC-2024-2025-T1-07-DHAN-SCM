<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id', 
        'product_id', 
        'quantity', 
        'unit_price', 
        'discount', // ✅ New field
        'total_price', 
        'created_by', 
        'updated_by'
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
    public function orderTemporaryAllocations()
    {
        return $this->hasMany(OrderTemporaryAllocation::class);
    }
    public function outgoingStocks()
    {
        return $this->hasMany(OutgoingStock::class);
    }
}