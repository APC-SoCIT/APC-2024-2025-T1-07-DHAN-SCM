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
        Schema::create('outgoing_stocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('demo_unit_id')->nullable()->constrained('demo_units');
            $table->foreignId('order_item_id')->nullable()->constrained('purchase_order_items');
            $table->foreignId('incoming_stock_id')->constrained('incoming_stocks');
            $table->string('type');
            $table->text('remarks')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('outgoing_stocks');
    }
};
