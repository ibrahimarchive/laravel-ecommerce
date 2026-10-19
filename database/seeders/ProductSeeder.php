<?php

namespace Database\Seeders;

use App\Models\AttributeValue;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    /**
     * Seed the product catalog, including images, attribute values, and variants.
     */
    public function run(): void
    {
        $categories = Category::query()->get()->keyBy('slug');
        $brands = Brand::query()->get()->keyBy('slug');
        /** @var Collection<string, AttributeValue> $attributeValues */
        $attributeValues = AttributeValue::query()->get()->keyBy('slug');

        foreach ($this->catalog() as $data) {
            /** @var Category|null $category */
            $category = $categories->get($data['category']);
            /** @var Brand|null $brand */
            $brand = $brands->get($data['brand']);

            $product = Product::factory()->create([
                'category_id' => $category?->id,
                'brand_id' => $brand?->id,
                'name' => $data['name'],
                'slug' => Product::generateSlug($data['name']),
                'sku' => Str::upper(Str::slug($data['name'], '-')),
                'short_description' => $data['short'],
                'description' => $this->description($data['name'], $data['short']),
                'price' => $data['price'],
                'compare_price' => $data['compare'] ?? null,
                'cost_price' => round($data['price'] * 0.6, 2),
                'stock_quantity' => $data['stock'],
                'manage_stock' => true,
                'is_active' => true,
                'is_featured' => $data['featured'] ?? false,
                'weight' => fake()->randomFloat(3, 0.2, 8),
                'published_at' => now(),
            ]);

            $valueIds = collect($data['values'] ?? [])
                ->map(fn (string $slug) => $attributeValues->get($slug)?->id)
                ->filter()
                ->values()
                ->all();

            $product->attributeValues()->sync($valueIds);

            $this->seedImages($product);
            $this->seedVariants($product, $data);
        }
    }

    /**
     * Create the placeholder images for a product.
     */
    protected function seedImages(Product $product): void
    {
        for ($index = 1; $index <= 3; $index++) {
            ProductImage::factory()->forProduct($product)->create([
                'path' => "https://picsum.photos/seed/{$product->slug}-{$index}/800/800",
                'alt' => "{$product->name} image {$index}",
                'sort_order' => $index - 1,
                'is_primary' => $index === 1,
            ]);
        }
    }

    /**
     * Create variants for a product based on its chosen variation attribute.
     *
     * @param  array<string, mixed>  $data
     */
    protected function seedVariants(Product $product, array $data): void
    {
        $variationAttribute = $data['variant_attribute'] ?? null;

        if ($variationAttribute === null) {
            return;
        }

        $product->loadMissing('attributeValues.attribute');

        $values = $product->attributeValues
            ->filter(fn (AttributeValue $value) => $value->attribute?->slug === $variationAttribute);

        if ($values->isEmpty()) {
            return;
        }

        $sortOrder = 0;

        foreach ($values as $value) {
            $variant = ProductVariant::factory()->forProduct($product)->create([
                'name' => $value->value,
                'sku' => Str::upper(Str::slug("{$product->slug}-{$value->slug}", '-')),
                'price' => $product->price,
                'compare_price' => $product->compare_price,
                'stock_quantity' => fake()->numberBetween(5, 40),
                'is_active' => true,
                'sort_order' => $sortOrder++,
            ]);

            $variant->attributeValues()->sync([$value->id]);
        }
    }

    /**
     * Build a descriptive product description.
     */
    protected function description(string $name, string $short): string
    {
        return "{$short}\n\nThe {$name} combines thoughtful design with dependable everyday performance. "
            .'Each unit is quality checked before dispatch and backed by our standard returns policy.';
    }

    /**
     * The demo product catalog.
     *
     * @return array<int, array<string, mixed>>
     */
    protected function catalog(): array
    {
        return [
            // Electronics — audio and cameras.
            ['name' => 'Aurora Wireless Headphones', 'category' => 'headphones-audio', 'brand' => 'aurora', 'price' => 129.99, 'compare' => 179.99, 'stock' => 42, 'featured' => true, 'short' => 'Over-ear noise cancelling headphones with 40-hour battery life.', 'values' => ['black', 'navy'], 'variant_attribute' => 'color'],
            ['name' => 'Nimbus Portable Bluetooth Speaker', 'category' => 'headphones-audio', 'brand' => 'nimbus', 'price' => 59.99, 'stock' => 88, 'short' => 'Waterproof portable speaker with rich, room-filling sound.', 'values' => ['black', 'red'], 'variant_attribute' => 'color'],
            ['name' => 'Vertex Studio Monitor Speakers', 'category' => 'headphones-audio', 'brand' => 'vertex', 'price' => 249.00, 'compare' => 299.00, 'stock' => 15, 'featured' => true, 'short' => 'Reference-grade nearfield monitors for accurate mixing.', 'values' => ['black']],
            ['name' => 'Kestrel Mirrorless Camera', 'category' => 'cameras', 'brand' => 'kestrel', 'price' => 899.00, 'compare' => 999.00, 'stock' => 9, 'featured' => true, 'short' => '24MP mirrorless camera body with 4K video recording.', 'values' => ['black']],
            ['name' => 'Ember Action Camera', 'category' => 'cameras', 'brand' => 'ember', 'price' => 199.99, 'stock' => 34, 'short' => 'Rugged 4K action camera with stabilisation and waterproof housing.', 'values' => ['black', 'blue'], 'variant_attribute' => 'color'],

            // Electronics — phones, laptops.
            ['name' => 'Aurora Pro Smartphone 5G', 'category' => 'smartphones', 'brand' => 'aurora', 'price' => 799.99, 'compare' => 899.99, 'stock' => 27, 'featured' => true, 'short' => 'Flagship 5G smartphone with a 120Hz OLED display.', 'values' => ['black', 'blue', '128gb', '256gb', '512gb'], 'variant_attribute' => 'storage'],
            ['name' => 'Nimbus Lite Smartphone', 'category' => 'smartphones', 'brand' => 'nimbus', 'price' => 329.00, 'stock' => 61, 'short' => 'Affordable everyday smartphone with all-day battery.', 'values' => ['black', 'white', '64gb', '128gb'], 'variant_attribute' => 'storage'],
            ['name' => 'Vertex Ultrabook 14', 'category' => 'laptops', 'brand' => 'vertex', 'price' => 1099.00, 'compare' => 1249.00, 'stock' => 14, 'featured' => true, 'short' => 'Featherweight 14-inch ultrabook with an all-day battery.', 'values' => ['256gb', '512gb', '1tb'], 'variant_attribute' => 'storage'],
            ['name' => 'Lumen Gaming Laptop 16', 'category' => 'laptops', 'brand' => 'lumen', 'price' => 1599.00, 'stock' => 7, 'short' => 'High-refresh gaming laptop with dedicated graphics.', 'values' => ['512gb', '1tb'], 'variant_attribute' => 'storage'],

            // Fashion.
            ['name' => 'Northwind Classic Cotton Tee', 'category' => 'mens-clothing', 'brand' => 'northwind', 'price' => 24.99, 'compare' => 34.99, 'stock' => 140, 'featured' => true, 'short' => 'Soft combed cotton t-shirt with a relaxed regular fit.', 'values' => ['xs', 's', 'm', 'l', 'xl', 'xxl', 'black', 'white', 'navy'], 'variant_attribute' => 'size'],
            ['name' => 'Northwind Slim Fit Chinos', 'category' => 'mens-clothing', 'brand' => 'northwind', 'price' => 54.99, 'stock' => 76, 'short' => 'Stretch cotton chinos cut for a modern slim silhouette.', 'values' => ['s', 'm', 'l', 'xl', 'navy', 'black'], 'variant_attribute' => 'size'],
            ['name' => 'Terra Flannel Overshirt', 'category' => 'mens-clothing', 'brand' => 'terra', 'price' => 44.99, 'compare' => 59.99, 'stock' => 52, 'short' => 'Brushed flannel overshirt perfect for layering.', 'values' => ['s', 'm', 'l', 'xl', 'red', 'green'], 'variant_attribute' => 'size'],
            ['name' => 'Zephyr Summer Wrap Dress', 'category' => 'womens-clothing', 'brand' => 'zephyr', 'price' => 64.99, 'compare' => 79.99, 'stock' => 48, 'featured' => true, 'short' => 'Flowing wrap dress in a lightweight breathable fabric.', 'values' => ['xs', 's', 'm', 'l', 'red', 'white'], 'variant_attribute' => 'size'],
            ['name' => 'Zephyr Chunky Knit Cardigan', 'category' => 'womens-clothing', 'brand' => 'zephyr', 'price' => 59.99, 'stock' => 39, 'short' => 'Cosy oversized cardigan with a chunky ribbed knit.', 'values' => ['s', 'm', 'l', 'xl', 'navy', 'black'], 'variant_attribute' => 'size'],
            ['name' => 'Cobalt Running Shoes', 'category' => 'shoes', 'brand' => 'cobalt', 'price' => 89.99, 'compare' => 119.99, 'stock' => 63, 'featured' => true, 'short' => 'Responsive cushioned running shoes for daily miles.', 'values' => ['s', 'm', 'l', 'xl', 'black', 'blue'], 'variant_attribute' => 'size'],
            ['name' => 'Cobalt Canvas Sneakers', 'category' => 'shoes', 'brand' => 'cobalt', 'price' => 49.99, 'stock' => 95, 'short' => 'Everyday canvas sneakers with a vulcanised rubber sole.', 'values' => ['s', 'm', 'l', 'xl', 'white', 'navy'], 'variant_attribute' => 'size'],
            ['name' => 'Terra Leather Weekender Bag', 'category' => 'bags-accessories', 'brand' => 'terra', 'price' => 149.00, 'compare' => 189.00, 'stock' => 22, 'featured' => true, 'short' => 'Full-grain leather weekender with a roomy main compartment.', 'values' => ['leather', 'black']],
            ['name' => 'Lumen Minimalist Backpack', 'category' => 'bags-accessories', 'brand' => 'lumen', 'price' => 69.99, 'stock' => 70, 'short' => 'Slim water-resistant backpack with a padded laptop sleeve.', 'values' => ['black', 'navy'], 'variant_attribute' => 'color'],

            // Home & Garden.
            ['name' => 'Northwind Solid Oak Coffee Table', 'category' => 'furniture', 'brand' => 'northwind', 'price' => 299.00, 'compare' => 349.00, 'stock' => 11, 'featured' => true, 'short' => 'Solid oak coffee table with a hard-wearing natural finish.', 'values' => []],
            ['name' => 'Northwind Ergonomic Office Chair', 'category' => 'furniture', 'brand' => 'northwind', 'price' => 249.00, 'stock' => 18, 'short' => 'Adjustable mesh office chair with lumbar support.', 'values' => ['black']],
            ['name' => 'Ember Cast Iron Skillet', 'category' => 'kitchen-dining', 'brand' => 'ember', 'price' => 39.99, 'compare' => 49.99, 'stock' => 84, 'short' => 'Pre-seasoned cast iron skillet that lasts a lifetime.', 'values' => []],
            ['name' => 'Ember Ceramic Dinnerware Set', 'category' => 'kitchen-dining', 'brand' => 'ember', 'price' => 89.99, 'stock' => 30, 'short' => 'Sixteen-piece stoneware dinner set for four people.', 'values' => ['white']],
            ['name' => 'Lumen Aromatherapy Diffuser', 'category' => 'home-decor', 'brand' => 'lumen', 'price' => 44.99, 'compare' => 54.99, 'stock' => 57, 'short' => 'Ultrasonic essential oil diffuser with ambient lighting.', 'values' => []],
            ['name' => 'Kestrel Cotton Bath Towel Set', 'category' => 'bedding', 'brand' => 'kestrel', 'price' => 34.99, 'stock' => 66, 'short' => 'Plush six-piece cotton towel set, quick drying.', 'values' => ['white', 'navy'], 'variant_attribute' => 'color'],

            // Sports & Outdoors.
            ['name' => 'Cobalt Adjustable Dumbbell Set', 'category' => 'fitness-equipment', 'brand' => 'cobalt', 'price' => 199.00, 'compare' => 249.00, 'stock' => 25, 'featured' => true, 'short' => 'Space-saving adjustable dumbbells for home training.', 'values' => []],
            ['name' => 'Vertex Pro Yoga Mat', 'category' => 'fitness-equipment', 'brand' => 'vertex', 'price' => 49.99, 'stock' => 73, 'short' => 'Non-slip cushioned yoga mat with alignment guides.', 'values' => ['green', 'blue'], 'variant_attribute' => 'color'],
            ['name' => 'Terra 4-Person Camping Tent', 'category' => 'outdoor-gear', 'brand' => 'terra', 'price' => 179.00, 'compare' => 219.00, 'stock' => 16, 'featured' => true, 'short' => 'Weatherproof four-person tent with quick-pitch poles.', 'values' => ['green']],
            ['name' => 'Kestrel Insulated Water Bottle', 'category' => 'outdoor-gear', 'brand' => 'kestrel', 'price' => 29.99, 'stock' => 120, 'short' => 'Double-walled bottle keeping drinks cold for 24 hours.', 'values' => ['black', 'blue', 'green'], 'variant_attribute' => 'color'],
            ['name' => 'Aurora Mountain Bike Helmet', 'category' => 'cycling', 'brand' => 'aurora', 'price' => 79.99, 'compare' => 99.99, 'stock' => 44, 'short' => 'Ventilated trail helmet with adjustable retention system.', 'values' => ['s', 'm', 'l', 'xl', 'black', 'red'], 'variant_attribute' => 'size'],

            // Beauty & Health.
            ['name' => 'Zephyr Vitamin C Brightening Serum', 'category' => 'skincare', 'brand' => 'zephyr', 'price' => 32.00, 'compare' => 42.00, 'stock' => 91, 'featured' => true, 'short' => 'Antioxidant serum that visibly brightens and evens skin tone.', 'values' => []],
            ['name' => 'Zephyr Hydrating Day Moisturiser', 'category' => 'skincare', 'brand' => 'zephyr', 'price' => 27.00, 'stock' => 78, 'short' => 'Lightweight daily moisturiser with hyaluronic acid.', 'values' => []],
            ['name' => 'Ember Argan Oil Repair Shampoo', 'category' => 'hair-care', 'brand' => 'ember', 'price' => 21.99, 'stock' => 103, 'short' => 'Sulphate-free shampoo enriched with argan oil.', 'values' => []],
            ['name' => 'Aurora Signature Eau de Parfum', 'category' => 'fragrance', 'brand' => 'aurora', 'price' => 89.00, 'compare' => 110.00, 'stock' => 37, 'featured' => true, 'short' => 'Warm amber and citrus eau de parfum with lasting sillage.', 'values' => []],

            // Toys & Games.
            ['name' => 'Nimbus Family Board Game Night', 'category' => 'board-games', 'brand' => 'nimbus', 'price' => 39.99, 'compare' => 49.99, 'stock' => 58, 'featured' => true, 'short' => 'Fast-paced party board game for up to eight players.', 'values' => []],
            ['name' => 'Nimbus Wooden Building Blocks', 'category' => 'building-blocks', 'brand' => 'nimbus', 'price' => 34.99, 'stock' => 64, 'short' => 'Fifty-piece sustainably sourced wooden block set.', 'values' => []],
            ['name' => 'Terra Junior Garden Tool Kit', 'category' => 'outdoor-play', 'brand' => 'terra', 'price' => 24.99, 'stock' => 82, 'short' => 'Child-safe garden tool set encouraging outdoor play.', 'values' => []],
        ];
    }
}
