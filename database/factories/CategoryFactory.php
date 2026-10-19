<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = Str::title(fake()->unique()->words(2, true));

        return [
            'parent_id' => null,
            'name' => $name,
            'slug' => Str::slug($name),
            'description' => fake()->paragraph(),
            'image' => null,
            'meta_title' => $name,
            'meta_description' => fake()->sentence(),
            'is_active' => true,
            'is_featured' => false,
            'sort_order' => fake()->numberBetween(0, 100),
        ];
    }

    /**
     * Indicate that the category is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Indicate that the category is featured.
     */
    public function featured(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_featured' => true,
        ]);
    }

    /**
     * Nest the category under the given parent.
     */
    public function childOf(Category $parent): static
    {
        return $this->state(fn (array $attributes) => [
            'parent_id' => $parent->getKey(),
        ]);
    }
}
