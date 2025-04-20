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

        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->id();
            $table->string('ponumber')->nullable()->unique(); // Added PO Number (Must be Unique)
            $table->foreignId('supplier_id')->constrained('suppliers');
            $table->date('order_date');
            $table->decimal('total_amount', 15, 2)->default(0);
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
        Schema::dropIfExists('purchase_orders');
    }
};
