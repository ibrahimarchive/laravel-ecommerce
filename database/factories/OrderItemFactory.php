<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OrderItem>
 */
class OrderItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $quantity = fake()->numberBetween(1, 4);
        $unitPrice = fake()->randomFloat(2, 5, 400);
        $subtotal = round($unitPrice * $quantity, 2);
        $tax = round($subtotal * 0.08, 2);

        return [
            'order_id' => Order::factory(),
            'product_id' => null,
            'product_variant_id' => null,
            'product_name' => fake()->words(3, true),
            'variant_name' => null,
            'sku' => 'SKU-'.fake()->bothify('??####'),
            'options' => null,
            'unit_price' => $unitPrice,
            'quantity' => $quantity,
            'subtotal' => $subtotal,
            'discount_total' => 0,
            'tax_total' => $tax,
            'total' => round($subtotal + $tax, 2),
        ];
    }

    /**
     * Attach the item to the given order.
     */
    public function forOrder(Order $order): static
    {
        return $this->state(fn (array $attributes) => [
            'order_id' => $order->getKey(),
        ]);
    }

    /**
     * Attach the item to the given product.
     */
    public function forProduct(Product $product): static
    {
        return $this->state(fn (array $attributes) => [
            'product_id' => $product->getKey(),
            'product_name' => $product->name,
            'sku' => $product->sku,
            'unit_price' => $product->price,
        ]);
    }

    /**
     * Attach the item to the given product variant.
     */
    public function forVariant(ProductVariant $variant): static
    {
        return $this->state(fn (array $attributes) => [
            'product_id' => $variant->product_id,
            'product_variant_id' => $variant->getKey(),
            'variant_name' => $variant->name,
            'sku' => $variant->sku,
            'unit_price' => $variant->effectivePrice(),
        ]);
    }
}
