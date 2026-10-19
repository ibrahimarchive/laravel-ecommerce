<?php

namespace Database\Seeders;

use App\Models\Attribute;
use App\Models\AttributeValue;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AttributeValueSeeder extends Seeder
{
    /**
     * Seed the values belonging to each product attribute.
     */
    public function run(): void
    {
        $attributes = Attribute::query()->get()->keyBy('slug');

        $values = [
            'size' => ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
            'color' => [
                ['Black', '#000000'],
                ['White', '#FFFFFF'],
                ['Red', '#EF4444'],
                ['Blue', '#3B82F6'],
                ['Green', '#22C55E'],
                ['Navy', '#1E3A8A'],
            ],
            'material' => ['Cotton', 'Polyester', 'Leather', 'Wool'],
            'storage' => ['64GB', '128GB', '256GB', '512GB', '1TB'],
        ];

        foreach ($values as $attributeSlug => $items) {
            $attribute = $attributes->get($attributeSlug);

            if (! $attribute instanceof Attribute) {
                continue;
            }

            foreach ($items as $index => $item) {
                [$value, $hex] = is_array($item) ? [$item[0], $item[1]] : [$item, null];

                AttributeValue::factory()->forAttribute($attribute)->create([
                    'value' => $value,
                    'slug' => Str::slug($value),
                    'color_hex' => $hex,
                    'sort_order' => $index,
                ]);
            }
        }
    }
}
