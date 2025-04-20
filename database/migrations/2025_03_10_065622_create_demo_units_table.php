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
        Schema::create('demo_units', function (Blueprint $table) {
            $table->id();
            $table->foreignId('incoming_stock_id')->constrained('incoming_stocks')->cascadeOnDelete();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->dateTime('demo_start');
            $table->dateTime('demo_end')->nullable();
            $table->foreignId('assigned_person_id')->constrained('users');
            $table->foreignId('status_id')->constrained('statuses'); // ✅ Linked to statuses table
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('demo_units');
    }
};
