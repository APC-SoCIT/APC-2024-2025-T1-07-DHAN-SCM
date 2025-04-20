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
            Schema::create('barcodes', function (Blueprint $table) {
                $table->id();
                $table->foreignId('product_type_id')->constrained('product_types');
                $table->foreignId('product_id')->constrained('products');
                $table->foreignId('purchase_order_item_id')->nullable()->constrained('purchase_order_items');
                $table->string('lot_number')->nullable();
                $table->date('expiry_date')->nullable();
                $table->string('serial_number')->nullable();
                $table->string('barcode')->nullable();
                $table->boolean('read_status')->default(false);
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
        Schema::dropIfExists('barcodes');
    }
};
