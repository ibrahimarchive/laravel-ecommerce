<?php

namespace Database\Seeders;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use Illuminate\Database\Seeder;

class OrderStatusHistorySeeder extends Seeder
{
    /**
     * Record the status journey for each seeded order.
     */
    public function run(): void
    {
        $paths = [
            OrderStatus::Pending->value => [[null, OrderStatus::Pending]],
            OrderStatus::Processing->value => [[null, OrderStatus::Pending], [OrderStatus::Pending, OrderStatus::Processing]],
            OrderStatus::Shipped->value => [[null, OrderStatus::Pending], [OrderStatus::Pending, OrderStatus::Processing], [OrderStatus::Processing, OrderStatus::Shipped]],
            OrderStatus::Delivered->value => [[null, OrderStatus::Pending], [OrderStatus::Pending, OrderStatus::Processing], [OrderStatus::Processing, OrderStatus::Shipped], [OrderStatus::Shipped, OrderStatus::Delivered]],
            OrderStatus::Cancelled->value => [[null, OrderStatus::Pending], [OrderStatus::Pending, OrderStatus::Cancelled]],
            OrderStatus::Refunded->value => [[null, OrderStatus::Pending], [OrderStatus::Pending, OrderStatus::Processing], [OrderStatus::Processing, OrderStatus::Shipped], [OrderStatus::Shipped, OrderStatus::Delivered], [OrderStatus::Delivered, OrderStatus::Refunded]],
        ];

        foreach (Order::query()->get() as $order) {
            $path = $paths[$order->status->value] ?? [[null, $order->status]];
            $start = $order->placed_at ?? $order->created_at;

            foreach ($path as $index => [$from, $to]) {
                $timestamp = $start->copy()->addHours($index * 6);

                OrderStatusHistory::factory()->forOrder($order)->create([
                    'from_status' => $from,
                    'to_status' => $to,
                    'note' => $this->noteFor($to),
                    'is_customer_notified' => true,
                    'created_at' => $timestamp,
                    'updated_at' => $timestamp,
                ]);
            }
        }
    }

    /**
     * Provide a human readable note for a status change.
     */
    protected function noteFor(OrderStatus $status): string
    {
        return match ($status) {
            OrderStatus::Pending => 'Order received and awaiting payment confirmation.',
            OrderStatus::Processing => 'Payment confirmed. The order is being prepared for dispatch.',
            OrderStatus::Shipped => 'The order has been handed to the carrier.',
            OrderStatus::Delivered => 'The order was delivered to the customer.',
            OrderStatus::Cancelled => 'The order was cancelled.',
            OrderStatus::Refunded => 'The order was refunded.',
        };
    }
}
