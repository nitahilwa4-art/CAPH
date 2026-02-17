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
        Schema::create('recurring_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name'); // "Netflix", "Listrik"
            $table->decimal('amount', 15, 2);
            $table->foreignId('wallet_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['INCOME', 'EXPENSE', 'TRANSFER']);
            $table->string('category');
            $table->enum('frequency', ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']);
            $table->date('start_date');
            $table->date('next_run_date');
            $table->boolean('auto_cut')->default(true); // True = Auto Create, False = Pending Confirmation
            $table->boolean('is_active')->default(true);
            $table->text('description')->nullable();
            $table->timestamps();

            // Indexes for performance
            $table->index(['user_id', 'next_run_date', 'is_active', 'auto_cut'], 'recurring_due_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('recurring_transactions');
    }
};
