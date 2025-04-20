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
        Schema::create('inventory_references', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('inventory_movement_id')->constrained('inventory_movements');
            $table->foreignId('order_id')->nullable()->constrained('orders'); // Reference to orders (can be null)
            $table->foreignId('purchase_order_id')->nullable()->constrained('purchase_orders'); // Reference to POs (can be null)
            $table->foreignId('demo_request_id')->nullable()->constrained('demo_requests'); // Reference to demo requests (can be null)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_references');
    }
};
