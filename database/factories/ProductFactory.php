<?php

namespace Database\Factories;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = Str::title(fake()->unique()->words(3, true));
        $price = fake()->randomFloat(2, 5, 500);

        return [
            'category_id' => Category::factory(),
            'brand_id' => Brand::factory(),
            'name' => $name,
            'slug' => Str::slug($name),
            'sku' => 'SKU-'.Str::upper(Str::random(8)),
            'short_description' => fake()->sentence(),
            'description' => fake()->paragraphs(3, true),
            'price' => $price,
            'compare_price' => null,
            'cost_price' => round($price * 0.6, 2),
            'stock_quantity' => fake()->numberBetween(0, 200),
            'low_stock_threshold' => 5,
            'manage_stock' => true,
            'is_active' => true,
            'is_featured' => false,
            'weight' => fake()->randomFloat(3, 0.1, 20),
            'meta_title' => $name,
            'meta_description' => fake()->sentence(),
            'published_at' => now(),
        ];
    }

    /**
     * Indicate that the product is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Indicate that the product is featured.
     */
    public function featured(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_featured' => true,
        ]);
    }

    /**
     * Indicate that the product is not published.
     */
    public function unpublished(): static
    {
        return $this->state(fn (array $attributes) => [
            'published_at' => null,
        ]);
    }

    /**
     * Indicate that the product is out of stock.
     */
    public function outOfStock(): static
    {
        return $this->state(fn (array $attributes) => [
            'stock_quantity' => 0,
        ]);
    }

    /**
     * Indicate that the product is on sale.
     */
    public function onSale(): static
    {
        return $this->state(fn (array $attributes) => [
            'compare_price' => round($attributes['price'] * 1.25, 2),
        ]);
    }

    /**
     * Assign the product to the given category.
     */
    public function forCategory(Category $category): static
    {
        return $this->state(fn (array $attributes) => [
            'category_id' => $category->getKey(),
        ]);
    }

    /**
     * Assign the product to the given brand.
     */
    public function forBrand(Brand $brand): static
    {
        return $this->state(fn (array $attributes) => [
            'brand_id' => $brand->getKey(),
        ]);
    }
}
