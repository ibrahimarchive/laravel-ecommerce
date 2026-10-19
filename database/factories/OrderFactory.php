<?php

namespace Database\Factories;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $subtotal = fake()->randomFloat(2, 20, 800);
        $discount = 0.0;
        $tax = round($subtotal * 0.08, 2);
        $shipping = fake()->randomFloat(2, 0, 25);
        $grandTotal = round($subtotal - $discount + $tax + $shipping, 2);

        return [
            'number' => Order::generateNumber(),
            'user_id' => null,
            'customer_name' => fake()->name(),
            'customer_email' => fake()->safeEmail(),
            'customer_phone' => fake()->phoneNumber(),
            'status' => OrderStatus::Pending,
            'payment_status' => PaymentStatus::Pending,
            'payment_method' => PaymentMethod::CashOnDelivery,
            'payment_reference' => null,
            'coupon_id' => null,
            'coupon_code' => null,
            'shipping_address_id' => null,
            'billing_address_id' => null,
            'shipping_address' => null,
            'billing_address' => null,
            'currency' => 'USD',
            'items_count' => 0,
            'subtotal' => $subtotal,
            'discount_total' => $discount,
            'tax_total' => $tax,
            'shipping_total' => $shipping,
            'grand_total' => $grandTotal,
            'amount_paid' => 0,
            'shipping_method' => 'standard',
            'tracking_number' => null,
            'carrier' => null,
            'customer_note' => null,
            'admin_note' => null,
            'placed_at' => now(),
            'paid_at' => null,
            'shipped_at' => null,
            'delivered_at' => null,
            'cancelled_at' => null,
            'refunded_at' => null,
        ];
    }

    /**
     * Assign the order to the given user.
     */
    public function forUser(User $user): static
    {
        return $this->state(fn (array $attributes) => [
            'user_id' => $user->getKey(),
            'customer_name' => $user->name,
            'customer_email' => $user->email,
        ]);
    }

    /**
     * Indicate that the order has been paid.
     */
    public function paid(): static
    {
        return $this->state(fn (array $attributes) => [
            'payment_status' => PaymentStatus::Paid,
            'amount_paid' => $attributes['grand_total'],
            'paid_at' => now(),
        ]);
    }

    /**
     * Indicate that the order has been shipped.
     */
    public function shipped(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => OrderStatus::Shipped,
            'payment_status' => PaymentStatus::Paid,
            'amount_paid' => $attributes['grand_total'],
            'paid_at' => now(),
            'shipped_at' => now(),
            'tracking_number' => strtoupper(fake()->bothify('??########')),
            'carrier' => fake()->randomElement(['DHL', 'FedEx', 'UPS', 'USPS']),
        ]);
    }

    /**
     * Indicate that the order has been delivered.
     */
    public function delivered(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => OrderStatus::Delivered,
            'payment_status' => PaymentStatus::Paid,
            'amount_paid' => $attributes['grand_total'],
            'paid_at' => now(),
            'shipped_at' => now(),
            'delivered_at' => now(),
        ]);
    }

    /**
     * Indicate that the order has been cancelled.
     */
    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => OrderStatus::Cancelled,
            'cancelled_at' => now(),
        ]);
    }
}
