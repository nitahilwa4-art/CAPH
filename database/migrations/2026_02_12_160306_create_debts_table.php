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
        Schema::create('debts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['DEBT', 'RECEIVABLE', 'BILL']);
            $table->string('person');
            $table->decimal('amount', 15, 2);
            $table->text('description');
            $table->date('due_date');
            $table->boolean('is_paid')->default(false);
            $table->timestamps();

            // Index for quick filtering by status
            $table->index(['user_id', 'is_paid', 'due_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('debts');
    }
};
