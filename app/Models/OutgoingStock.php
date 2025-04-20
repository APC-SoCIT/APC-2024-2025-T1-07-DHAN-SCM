<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OutgoingStock extends Model
{
    use HasFactory;

    protected $table = 'outgoing_stocks';

    protected $fillable = [
        'demo_unit_id',
        'order_item_id',
        'incoming_stock_id',
        'type',
        'remarks',
    ];

    // ✅ Relationships
    public function demoUnit(): BelongsTo
    {
        return $this->belongsTo(DemoUnit::class, 'demo_unit_id');
    }

    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrderItem::class, 'order_item_id');
    }

    public function incomingStock(): BelongsTo
    {
        return $this->belongsTo(IncomingStock::class, 'incoming_stock_id');
    }
}