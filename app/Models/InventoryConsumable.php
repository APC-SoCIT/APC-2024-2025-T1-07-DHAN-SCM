<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryConsumable extends Model
{
    protected $casts = [
        'expiry_date' => 'date', // Cast expiry_date as a Date object
    ];
    protected $fillable = ['product_id', 'purchase_order_item_id', 'barcode',
    'lot_number', 'expiry_date', 'quantity',  'notes','created_by', 'updated_by'];

  /*  protected static function boot()
    {
        parent::boot();

        static::creating(function ($inventoryConsumable) {
            // Retrieve related data for the barcode
            $product = $inventoryConsumable->product()->first(); // Get the associated product
            $sku = $product->sku ?? 'SKU000'; // Use the product's SKU or a default value if null

            $batchNumber = $inventoryConsumable->batch_number ?? 'batch01'; // Default batch number
            $expiryDate = $inventoryConsumable->expiry_date 
                ? \Carbon\Carbon::parse($inventoryConsumable->expiry_date)->format('mY') // Format expiry date as MMYYYY
                : '000000'; // Default if no expiry date is provided

            // Generate the barcode
            $inventoryConsumable->barcode = "{$sku}-{$batchNumber}-{$expiryDate}";
        });
    }*/

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function purchaseOrderItem()
    {
        return $this->belongsTo(PurchaseOrderItem::class);
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
