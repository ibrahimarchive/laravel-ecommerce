<?php

namespace Database\Factories;

use App\Models\NewsletterSubscriber;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<NewsletterSubscriber>
 */
class NewsletterSubscriberFactory extends Factory
{
    protected $model = NewsletterSubscriber::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'email' => fake()->unique()->safeEmail(),
            'name' => fake()->optional()->name(),
            'token' => Str::random(64),
            'is_active' => true,
            'subscribed_at' => now(),
            'unsubscribed_at' => null,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
            'unsubscribed_at' => now(),
        ]);
    }

    public function unsubscribed(): static
    {
        return $this->inactive();
    }
}
