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
        Schema::create('carts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('session_id')->nullable()->index();
            $table->foreignId('coupon_id')->nullable()->constrained()->nullOnDelete();
            $table->string('shipping_method')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'updated_at'], 'carts_user_updated_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('carts');
    }
};
