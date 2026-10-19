<?php

namespace Database\Seeders;

use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Database\Seeder;

class OrderItemSeeder extends Seeder
{
    /**
     * Attach line items to each order and recalculate the order totals.
     */
    public function run(): void
    {
        $products = Product::query()->get();

        if ($products->isEmpty()) {
            return;
        }

        foreach (Order::query()->get() as $order) {
            $lineCount = min(fake()->numberBetween(1, 4), $products->count());
            $subtotal = 0.0;
            $taxTotal = 0.0;
            $itemCount = 0;

            foreach ($products->random($lineCount) as $product) {
                $quantity = fake()->numberBetween(1, 3);
                $unitPrice = (float) $product->price;
                $lineSubtotal = round($unitPrice * $quantity, 2);
                $lineTax = round($lineSubtotal * 0.0825, 2);

                OrderItem::factory()->forOrder($order)->create([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'variant_name' => null,
                    'sku' => $product->sku,
                    'unit_price' => $unitPrice,
                    'quantity' => $quantity,
                    'subtotal' => $lineSubtotal,
                    'discount_total' => 0,
                    'tax_total' => $lineTax,
                    'total' => round($lineSubtotal + $lineTax, 2),
                    'created_at' => $order->created_at,
                    'updated_at' => $order->created_at,
                ]);

                $subtotal += $lineSubtotal;
                $taxTotal += $lineTax;
                $itemCount += $quantity;
            }

            $shippingTotal = $subtotal >= 75 ? 0.0 : 9.99;
            $grandTotal = round($subtotal + $taxTotal + $shippingTotal, 2);

            $order->timestamps = false;
            $order->forceFill([
                'items_count' => $itemCount,
                'subtotal' => round($subtotal, 2),
                'discount_total' => 0,
                'tax_total' => round($taxTotal, 2),
                'shipping_total' => round($shippingTotal, 2),
                'grand_total' => $grandTotal,
                'amount_paid' => $order->payment_status === PaymentStatus::Paid ? $grandTotal : 0,
            ])->save();
        }
    }
}
