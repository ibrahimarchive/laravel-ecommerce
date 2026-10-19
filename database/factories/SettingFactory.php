<?php

namespace Database\Factories;

use App\Models\Setting;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Setting>
 */
class SettingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $key = 'setting_'.Str::lower(Str::random(8));

        return [
            'key' => $key,
            'value' => fake()->word(),
            'group' => 'general',
        ];
    }

    /**
     * Indicate that the setting belongs to the given group.
     */
    public function group(string $group): static
    {
        return $this->state(fn (array $attributes) => [
            'group' => $group,
        ]);
    }

    /**
     * Indicate that the setting stores the given key and value.
     */
    public function keyValue(string $key, mixed $value): static
    {
        return $this->state(fn (array $attributes) => [
            'key' => $key,
            'value' => is_scalar($value) ? (string) $value : json_encode($value),
        ]);
    }
}
