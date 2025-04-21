<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderTemporaryAllocation extends Model
{
    protected $fillable = [
        'order_item_id',
        'incoming_stock_id',
        'product_id',
        'created_by',
        'updated_by',
    ];

    public function orderItem()
    {
        return $this->belongsTo(OrderItem::class);
    }

    public function incomingStock()
    {
        return $this->belongsTo(IncomingStock::class);
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
}