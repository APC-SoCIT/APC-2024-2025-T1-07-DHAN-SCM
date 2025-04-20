<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductUnit extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name', // Name of the unit
        'abbreviation', // Short form of the unit
        'description', // Description of the unit
    ];

    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
