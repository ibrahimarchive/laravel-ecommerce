<?php

namespace Database\Seeders;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Address;
use App\Models\Order;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class OrderSeeder extends Seeder
{
    /**
     * Seed orders for customer accounts across a range of statuses.
     */
    public function run(): void
    {
        $customers = User::query()
            ->whereHas('roles', fn ($query) => $query->where('slug', Role::CUSTOMER_SLUG))
            ->with('addresses')
            ->get();

        $statuses = [
            OrderStatus::Pending,
            OrderStatus::Processing,
            OrderStatus::Shipped,
            OrderStatus::Delivered,
            OrderStatus::Delivered,
            OrderStatus::Cancelled,
        ];

        foreach ($customers as $customer) {
            $orderCount = fake()->numberBetween(1, 4);

            for ($index = 0; $index < $orderCount; $index++) {
                $status = fake()->randomElement($statuses);
                $paymentMethod = fake()->randomElement(PaymentMethod::cases());
                $placedAt = now()->subDays(fake()->numberBetween(1, 120))->subMinutes(fake()->numberBetween(0, 1440));

                /** @var Address|null $address */
                $address = $customer->addresses->firstWhere('is_default', true)
                    ?? $customer->addresses->first();

                $snapshot = $address?->toSnapshot();

                Order::factory()->forUser($customer)->create([
                    'customer_name' => $customer->name,
                    'customer_email' => $customer->email,
                    'customer_phone' => $customer->phone,
                    'status' => $status,
                    'payment_status' => $this->paymentStatusFor($status),
                    'payment_method' => $paymentMethod,
                    'shipping_address' => $snapshot,
                    'billing_address' => $snapshot,
                    'shipping_method' => 'standard',
                    'placed_at' => $placedAt,
                    'paid_at' => $this->paidAtFor($status, $placedAt),
                    'shipped_at' => $status === OrderStatus::Shipped || $status === OrderStatus::Delivered
                        ? $placedAt->copy()->addHours(6)
                        : null,
                    'delivered_at' => $status === OrderStatus::Delivered
                        ? $placedAt->copy()->addDays(3)
                        : null,
                    'cancelled_at' => $status === OrderStatus::Cancelled
                        ? $placedAt->copy()->addHours(12)
                        : null,
                    'created_at' => $placedAt,
                    'updated_at' => $placedAt,
                ]);
            }
        }
    }

    /**
     * Resolve the payment status implied by an order status.
     */
    protected function paymentStatusFor(OrderStatus $status): PaymentStatus
    {
        return match ($status) {
            OrderStatus::Pending, OrderStatus::Cancelled => PaymentStatus::Pending,
            OrderStatus::Refunded => PaymentStatus::Refunded,
            default => PaymentStatus::Paid,
        };
    }

    /**
     * Resolve the paid-at timestamp for an order status.
     */
    protected function paidAtFor(OrderStatus $status, Carbon $placedAt): ?Carbon
    {
        return match ($status) {
            OrderStatus::Processing, OrderStatus::Shipped, OrderStatus::Delivered => $placedAt->copy()->addMinutes(30),
            default => null,
        };
    }
}
