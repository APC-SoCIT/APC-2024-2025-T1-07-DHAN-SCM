<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('sku'); // SKU column
            $table->string('model')->nullable(); // Model column
            $table->text('description')->nullable();
            $table->foreignId('product_unit_id')->constrained('product_units');
            $table->integer('minimum_quantity');
            $table->decimal('profit_margin', 5, 2);
            $table->string('image_url')->nullable();
            $table->foreignId('supplier_id')->nullable()->constrained('suppliers');
            $table->decimal('supplier_price', 15, 2);
            $table->foreignId('location_id')->nullable()->constrained('locations');
            $table->foreignId('warehouse_id')->nullable()->constrained('warehouses');
            $table->boolean('is_machine')->default(false);
            $table->foreignId('status_id')->constrained('statuses');
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('updated_by')->constrained('users');
            $table->timestamps();
        });
        
        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
