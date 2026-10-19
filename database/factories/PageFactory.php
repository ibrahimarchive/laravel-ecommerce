<?php

namespace Database\Factories;

use App\Models\Page;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Page>
 */
class PageFactory extends Factory
{
    protected $model = Page::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = fake()->unique()->sentence(4);

        return [
            'title' => rtrim($title, '.'),
            'slug' => Str::slug($title),
            'excerpt' => fake()->sentence(12),
            'content' => fake()->paragraphs(4, true),
            'meta_title' => rtrim($title, '.'),
            'meta_description' => fake()->sentence(15),
            'is_published' => true,
            'show_in_footer' => true,
            'published_at' => now(),
            'sort_order' => fake()->numberBetween(0, 100),
        ];
    }

    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_published' => false,
            'published_at' => null,
        ]);
    }

    public function inFooter(): static
    {
        return $this->state(fn (array $attributes) => [
            'show_in_footer' => true,
        ]);
    }
}
