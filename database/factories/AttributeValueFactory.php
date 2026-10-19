<?php

namespace Database\Factories;

use App\Models\Attribute;
use App\Models\AttributeValue;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<AttributeValue>
 */
class AttributeValueFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $value = Str::title(fake()->unique()->word());

        return [
            'attribute_id' => Attribute::factory(),
            'value' => $value,
            'slug' => Str::slug($value),
            'color_hex' => null,
            'sort_order' => fake()->numberBetween(0, 100),
        ];
    }

    /**
     * Attach the value to the given attribute.
     */
    public function forAttribute(Attribute $attribute): static
    {
        return $this->state(fn (array $attributes) => [
            'attribute_id' => $attribute->getKey(),
        ]);
    }

    /**
     * Indicate that the value represents a colour.
     */
    public function color(?string $hex = null): static
    {
        return $this->state(fn (array $attributes) => [
            'color_hex' => $hex ?? fake()->hexColor(),
        ]);
    }
}
