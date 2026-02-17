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
        Schema::create('budgets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('category');
            $table->decimal('limit', 15, 2);
            $table->string('period'); // Format: YYYY-MM for monthly, YYYY-Www for weekly, etc.
            $table->enum('frequency', ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']);
            $table->timestamps();
            
            // Unique constraint to prevent duplicate budgets
            $table->unique(['user_id', 'category', 'period']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('budgets');
    }
};
