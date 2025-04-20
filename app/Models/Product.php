<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Product extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $casts = [
        'is_machine' => 'boolean',
    ];
    protected $fillable = [
        'name',
        'sku',
        'model',
        'description',
        'product_unit_id',
        'minimum_quantity',
        'profit_margin',
        'image_url',
        'supplier_id',
        'supplier_price',
        'location_id',
        'is_machine',
        'warehouse_id',
        'status_id',
        'created_by',
        'updated_by'
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();
    
        static::creating(function ($product) {
            // Clean product name: Remove special characters and spaces
            $cleanName = preg_replace('/[^A-Za-z0-9]/', '', $product->name);
    
            // Generate SKU: First 4 letters of cleaned product name + 4 random alphanumeric characters
            $product->sku = strtoupper(substr($cleanName, 0, 4)) . strtoupper(Str::random(4));
        });
    }

    /**
     * Get the product unit.
     */
    public function productUnit()
    {
        return $this->belongsTo(ProductUnit::class, 'product_unit_id');
    }

    /**
     * Get the supplier.
     */
    public function supplier()
    {
        return $this->belongsTo(Supplier::class, 'supplier_id');
    }

    /**
     * Get the location.
     */
    public function location()
    {
        return $this->belongsTo(Location::class, 'location_id');
    }

    /**
     * Get the warehouse.
     */
    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class, 'warehouse_id');
    }

    /**
     * Get the status.
     */
    public function status()
    {
        return $this->belongsTo(Status::class, 'status_id');
    }

    /**
     * Get the user who created the product.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who updated the product.
     */
    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'product_tags');
    }

    public function incomingStocks()
    {
        return $this->hasMany(IncomingStock::class, 'product_id');
    }

    public function availableQuantity()
    {
        return $this->incomingStocks()->sum('quantity'); // Get total stock quantity
    }


}