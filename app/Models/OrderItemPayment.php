<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItemPayment extends Model
{
    protected $fillable = [
        'payment_transaction_id',
        'order_item_id',
        'payment_date',
        'amount_paid',
        'remarks',
        'created_by',
        'updated_by',
    ];

    public function paymentTransaction()
    {
        return $this->belongsTo(PaymentTransaction::class);
    }

    public function orderItem()
    {
        return $this->belongsTo(OrderItem::class);
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
