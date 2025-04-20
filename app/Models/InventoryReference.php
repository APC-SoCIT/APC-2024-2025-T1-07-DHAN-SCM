<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryReference extends Model
{
    use HasFactory;

    protected $fillable = [
        'inventory_movement_id',
        'order_id',
        'purchase_order_id',
        'demo_request_id',
    ];

    public function inventoryMovement()
    {
        return $this->belongsTo(InventoryMovement::class, 'inventory_movement_id');
    }

    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class, 'purchase_order_id');
    }

    public function demoRequest()
    {
        return $this->belongsTo(DemoRequest::class, 'demo_request_id');
    }
}
