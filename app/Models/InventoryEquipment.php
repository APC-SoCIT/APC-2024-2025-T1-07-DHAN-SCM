<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryEquipment extends Model
{
    protected $fillable = ['product_id', 'purchase_order_item_id','barcode',
     'serial_number', 'model_number', 'purchase_date', 'status_id', 
     'notes' ,'created_by', 'updated_by'];

  /*   protected static function boot()
    {
        parent::boot();

        static::creating(function ($inventoryEquipment) {
            // Retrieve related data for the barcode
            $product = $inventoryEquipment->product()->first(); // Get the associated product
            $sku = $product->sku ?? 'SKU000'; // Use the product's SKU or a default value if null
            $serialNumber = $inventoryEquipment->serial_number ?? 'SERIAL000'; // Default serial number

            // Generate the barcode
            $inventoryEquipment->barcode = "{$sku}-{$serialNumber}";
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

    public function status()
    {
        return $this->belongsTo(Status::class);
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

