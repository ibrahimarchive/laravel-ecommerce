<?php

namespace Database\Factories;

use App\Models\Cart;
use App\Models\Coupon;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Cart>
 */
class CartFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => null,
            'session_id' => Str::random(40),
            'coupon_id' => null,
            'shipping_method' => null,
            'note' => null,
        ];
    }

    /**
     * Assign the cart to the given user.
     */
    public function forUser(User $user): static
    {
        return $this->state(fn (array $attributes) => [
            'user_id' => $user->getKey(),
        ]);
    }

    /**
     * Assign the cart to the given session.
     */
    public function forSession(string $sessionId): static
    {
        return $this->state(fn (array $attributes) => [
            'session_id' => $sessionId,
        ]);
    }

    /**
     * Attach the given coupon to the cart.
     */
    public function withCoupon(Coupon $coupon): static
    {
        return $this->state(fn (array $attributes) => [
            'coupon_id' => $coupon->getKey(),
        ]);
    }
}
