<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<ProductVariant>
 */
class ProductVariantFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'name' => Str::title(fake()->word()),
            'sku' => 'VAR-'.Str::upper(Str::random(8)),
            'price' => fake()->randomFloat(2, 5, 500),
            'compare_price' => null,
            'stock_quantity' => fake()->numberBetween(0, 100),
            'is_active' => true,
            'sort_order' => fake()->numberBetween(0, 20),
        ];
    }

    /**
     * Indicate that the variant is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Indicate that the variant is out of stock.
     */
    public function outOfStock(): static
    {
        return $this->state(fn (array $attributes) => [
            'stock_quantity' => 0,
        ]);
    }

    /**
     * Indicate that the variant is on sale.
     */
    public function onSale(): static
    {
        return $this->state(fn (array $attributes) => [
            'compare_price' => round(($attributes['price'] ?? 100) * 1.25, 2),
        ]);
    }

    /**
     * Assign the variant to the given product.
     */
    public function forProduct(Product $product): static
    {
        return $this->state(fn (array $attributes) => [
            'product_id' => $product->getKey(),
        ]);
    }
}
