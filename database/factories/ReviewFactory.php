<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Review>
 */
class ReviewFactory extends Factory
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
            'user_id' => null,
            'author_name' => fake()->name(),
            'author_email' => fake()->safeEmail(),
            'rating' => fake()->numberBetween(1, 5),
            'title' => fake()->sentence(4),
            'body' => fake()->paragraph(),
            'is_approved' => false,
            'approved_at' => null,
        ];
    }

    /**
     * Indicate that the review is approved.
     */
    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_approved' => true,
            'approved_at' => now(),
        ]);
    }

    /**
     * Attach the review to the given product.
     */
    public function forProduct(Product $product): static
    {
        return $this->state(fn (array $attributes) => [
            'product_id' => $product->getKey(),
        ]);
    }

    /**
     * Attach the review to the given user.
     */
    public function byUser(User $user): static
    {
        return $this->state(fn (array $attributes) => [
            'user_id' => $user->getKey(),
            'author_name' => $user->name,
            'author_email' => $user->email,
        ]);
    }
}
