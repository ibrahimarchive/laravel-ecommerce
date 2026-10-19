<?php

namespace Database\Factories;

use App\Enums\DiscountType;
use App\Models\Coupon;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Coupon>
 */
class CouponFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => Str::upper(Str::random(8)),
            'name' => fake()->words(2, true),
            'description' => fake()->sentence(),
            'type' => DiscountType::Fixed,
            'value' => fake()->numberBetween(5, 50),
            'min_order_total' => null,
            'max_discount_amount' => null,
            'usage_limit' => null,
            'usage_limit_per_user' => null,
            'used_count' => 0,
            'is_active' => true,
            'starts_at' => null,
            'expires_at' => null,
        ];
    }

    /**
     * Indicate that the coupon applies a percentage discount.
     */
    public function percentage(float $value = 10): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => DiscountType::Percentage,
            'value' => $value,
        ]);
    }

    /**
     * Indicate that the coupon applies a fixed discount.
     */
    public function fixed(float $value = 10): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => DiscountType::Fixed,
            'value' => $value,
        ]);
    }

    /**
     * Indicate that the coupon is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Indicate that the coupon has expired.
     */
    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'starts_at' => now()->subMonth(),
            'expires_at' => now()->subDay(),
        ]);
    }
}
