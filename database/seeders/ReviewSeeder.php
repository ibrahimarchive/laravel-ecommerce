<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    /**
     * Seed customer reviews for a selection of products.
     */
    public function run(): void
    {
        $products = Product::query()->inRandomOrder()->limit(24)->get();

        foreach ($products as $product) {
            $count = fake()->numberBetween(2, 5);

            for ($index = 0; $index < $count; $index++) {
                $approved = fake()->boolean(80);

                Review::factory()->forProduct($product)->create([
                    'rating' => fake()->numberBetween(3, 5),
                    'is_approved' => $approved,
                    'approved_at' => $approved ? now()->subDays(fake()->numberBetween(1, 45)) : null,
                ]);
            }
        }

        $customer = User::query()->where('email', 'customer@shopfront.test')->first();

        if ($customer instanceof User && $products->count() >= 3) {
            foreach ($products->random(3) as $product) {
                Review::factory()->approved()->forProduct($product)->byUser($customer)->create();
            }
        }
    }
}
