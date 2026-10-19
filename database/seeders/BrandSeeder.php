<?php

namespace Database\Seeders;

use App\Models\Brand;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BrandSeeder extends Seeder
{
    /**
     * Seed the product brands.
     */
    public function run(): void
    {
        $brands = [
            ['Aurora', true],
            ['Nimbus', true],
            ['Vertex', true],
            ['Lumen', false],
            ['Northwind', false],
            ['Kestrel', true],
            ['Ember', false],
            ['Terra', false],
            ['Zephyr', false],
            ['Cobalt', false],
        ];

        foreach ($brands as $index => [$name, $featured]) {
            Brand::factory()->create([
                'name' => $name,
                'slug' => Str::slug($name),
                'description' => "{$name} crafts dependable products designed to last.",
                'website' => 'https://www.'.Str::lower($name).'.test',
                'is_active' => true,
                'is_featured' => $featured,
                'sort_order' => $index,
            ]);
        }
    }
}
