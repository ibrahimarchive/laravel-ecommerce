<?php

namespace Database\Factories;

use App\Models\Address;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Address>
 */
class AddressFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'label' => fake()->randomElement(['Home', 'Work', 'Other']),
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'company' => fake()->optional()->company(),
            'address_line_1' => fake()->streetAddress(),
            'address_line_2' => fake()->optional()->secondaryAddress(),
            'city' => fake()->city(),
            'state' => fake()->stateAbbr(),
            'postal_code' => fake()->postcode(),
            'country' => 'US',
            'phone' => fake()->phoneNumber(),
            'is_default' => false,
        ];
    }

    /**
     * Indicate that the address is the default for its user.
     */
    public function default(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_default' => true,
        ]);
    }

    /**
     * Assign the address to the given user.
     */
    public function forUser(User $user): static
    {
        return $this->state(fn (array $attributes) => [
            'user_id' => $user->getKey(),
        ]);
    }
}
