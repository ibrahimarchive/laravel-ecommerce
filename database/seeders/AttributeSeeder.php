<?php

namespace Database\Seeders;

use App\Models\Attribute;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AttributeSeeder extends Seeder
{
    /**
     * Seed the product attributes.
     */
    public function run(): void
    {
        $attributes = [
            ['Size', true, true],
            ['Color', true, true],
            ['Material', true, false],
            ['Storage', true, true],
        ];

        foreach ($attributes as $index => [$name, $filterable, $variation]) {
            Attribute::factory()->create([
                'name' => $name,
                'slug' => Str::slug($name),
                'type' => 'select',
                'is_filterable' => $filterable,
                'is_variation' => $variation,
                'sort_order' => $index,
            ]);
        }
    }
}
