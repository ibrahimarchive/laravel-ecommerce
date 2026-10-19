<?php

namespace Database\Factories;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CartItem>
 */
class CartItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'cart_id' => Cart::factory(),
            'product_id' => Product::factory(),
            'product_variant_id' => null,
            'quantity' => fake()->numberBetween(1, 5),
            'unit_price' => fake()->randomFloat(2, 5, 500),
        ];
    }

    /**
     * Assign the item to the given cart.
     */
    public function forCart(Cart $cart): static
    {
        return $this->state(fn (array $attributes) => [
            'cart_id' => $cart->getKey(),
        ]);
    }

    /**
     * Assign the item to the given product.
     */
    public function forProduct(Product $product): static
    {
        return $this->state(fn (array $attributes) => [
            'product_id' => $product->getKey(),
            'unit_price' => $product->price,
        ]);
    }

    /**
     * Assign the item to the given product variant.
     */
    public function forVariant(ProductVariant $variant): static
    {
        return $this->state(fn (array $attributes) => [
            'product_id' => $variant->product_id,
            'product_variant_id' => $variant->getKey(),
            'unit_price' => $variant->effectivePrice(),
        ]);
    }
}
