<?php

namespace Database\Factories;

use App\Models\ContactMessage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ContactMessage>
 */
class ContactMessageFactory extends Factory
{
    protected $model = ContactMessage::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->safeEmail(),
            'phone' => fake()->optional()->phoneNumber(),
            'subject' => fake()->sentence(6),
            'message' => fake()->paragraphs(2, true),
            'is_read' => false,
            'replied_at' => null,
        ];
    }

    public function read(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_read' => true,
        ]);
    }

    public function replied(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_read' => true,
            'replied_at' => now(),
        ]);
    }
}
