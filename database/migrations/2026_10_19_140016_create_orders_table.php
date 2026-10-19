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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('number')->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();

            $table->string('customer_name');
            $table->string('customer_email');
            $table->string('customer_phone')->nullable();

            $table->string('status')->default('pending');
            $table->string('payment_status')->default('pending');
            $table->string('payment_method')->nullable();
            $table->string('payment_reference')->nullable();

            $table->foreignId('coupon_id')->nullable()->constrained()->nullOnDelete();
            $table->string('coupon_code')->nullable();

            $table->foreignId('shipping_address_id')->nullable()->constrained('addresses')->nullOnDelete();
            $table->foreignId('billing_address_id')->nullable()->constrained('addresses')->nullOnDelete();
            $table->json('shipping_address')->nullable();
            $table->json('billing_address')->nullable();

            $table->string('currency', 3)->default('USD');
            $table->unsignedInteger('items_count')->default(0);
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('discount_total', 12, 2)->default(0);
            $table->decimal('tax_total', 12, 2)->default(0);
            $table->decimal('shipping_total', 12, 2)->default(0);
            $table->decimal('grand_total', 12, 2)->default(0);
            $table->decimal('amount_paid', 12, 2)->default(0);

            $table->string('shipping_method')->nullable();
            $table->string('tracking_number')->nullable();
            $table->string('carrier')->nullable();

            $table->text('customer_note')->nullable();
            $table->text('admin_note')->nullable();

            $table->timestamp('placed_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamp('refunded_at')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'placed_at'], 'orders_status_placed_index');
            $table->index(['payment_status', 'placed_at'], 'orders_payment_placed_index');
            $table->index(['user_id', 'placed_at'], 'orders_user_placed_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
