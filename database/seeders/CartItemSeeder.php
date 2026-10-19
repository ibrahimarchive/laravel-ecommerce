<?php

namespace Database\Seeders;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Database\Seeder;

class CartItemSeeder extends Seeder
{
    /**
     * Add products to the seeded carts.
     */
    public function run(): void
    {
        $products = Product::query()->get();

        if ($products->isEmpty()) {
            return;
        }

        foreach (Cart::query()->get() as $cart) {
            $count = min(fake()->numberBetween(1, 4), $products->count());

            foreach ($products->random($count) as $product) {
                CartItem::factory()->forCart($cart)->forProduct($product)->create([
                    'quantity' => fake()->numberBetween(1, 3),
                ]);
            }
        }
    }
}
