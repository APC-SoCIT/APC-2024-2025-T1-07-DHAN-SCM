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
        Schema::create('insurance_claims', function (Blueprint $table) {
            $table->id();
            $table->foreignId('incoming_stock_id')->constrained('incoming_stocks');
            $table->date('claim_date');
            $table->text('incident_description')->nullable();
            $table->decimal('claim_amount', 15, 2);
            $table->decimal('approved_amount', 15, 2);
            $table->foreignId('claim_status_id')->constrained('statuses');
            $table->string('insurer_name')->nullable();
            $table->string('policy_number')->nullable();
            $table->date('settlement_date')->nullable();
            $table->text('remarks')->nullable();
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
        Schema::dropIfExists('insurance_claims');
    }
};
