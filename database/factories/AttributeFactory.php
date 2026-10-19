<?php

namespace Database\Factories;

use App\Models\Attribute;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Attribute>
 */
class AttributeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = Str::title(fake()->unique()->word());

        return [
            'name' => $name,
            'slug' => Str::slug($name),
            'type' => 'select',
            'is_filterable' => true,
            'is_variation' => true,
            'sort_order' => fake()->numberBetween(0, 100),
        ];
    }

    /**
     * Indicate that the attribute is not filterable.
     */
    public function notFilterable(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_filterable' => false,
        ]);
    }

    /**
     * Indicate that the attribute is not used for variations.
     */
    public function notVariation(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_variation' => false,
        ]);
    }
}
