<?php

namespace Database\Factories;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OrderStatusHistory>
 */
class OrderStatusHistoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'user_id' => null,
            'from_status' => OrderStatus::Pending,
            'to_status' => OrderStatus::Processing,
            'note' => fake()->sentence(),
            'is_customer_notified' => false,
        ];
    }

    /**
     * Attach the history entry to the given order.
     */
    public function forOrder(Order $order): static
    {
        return $this->state(fn (array $attributes) => [
            'order_id' => $order->getKey(),
        ]);
    }

    /**
     * Record which user triggered the transition.
     */
    public function byUser(User $user): static
    {
        return $this->state(fn (array $attributes) => [
            'user_id' => $user->getKey(),
        ]);
    }

    /**
     * Define the status transition the entry represents.
     */
    public function transition(OrderStatus $from, OrderStatus $to): static
    {
        return $this->state(fn (array $attributes) => [
            'from_status' => $from,
            'to_status' => $to,
        ]);
    }
}
