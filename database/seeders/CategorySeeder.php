<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Seed the product categories, including one level of child categories.
     */
    public function run(): void
    {
        $tree = [
            'Electronics' => ['Smartphones', 'Laptops', 'Headphones & Audio', 'Cameras'],
            'Fashion' => ["Men's Clothing", "Women's Clothing", 'Shoes', 'Bags & Accessories'],
            'Home & Garden' => ['Furniture', 'Kitchen & Dining', 'Home Decor', 'Bedding'],
            'Sports & Outdoors' => ['Fitness Equipment', 'Outdoor Gear', 'Cycling'],
            'Beauty & Health' => ['Skincare', 'Hair Care', 'Fragrance'],
            'Toys & Games' => ['Board Games', 'Building Blocks', 'Outdoor Play'],
        ];

        $order = 0;

        foreach ($tree as $parentName => $children) {
            $parent = Category::factory()->create([
                'name' => $parentName,
                'slug' => Category::generateSlug($parentName),
                'description' => "Browse our {$parentName} range.",
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => $order++,
            ]);

            $childOrder = 0;

            foreach ($children as $childName) {
                Category::factory()->childOf($parent)->create([
                    'name' => $childName,
                    'slug' => Category::generateSlug($childName),
                    'description' => "Shop {$childName} in the {$parentName} collection.",
                    'is_active' => true,
                    'is_featured' => false,
                    'sort_order' => $childOrder++,
                ]);
            }
        }
    }
}
