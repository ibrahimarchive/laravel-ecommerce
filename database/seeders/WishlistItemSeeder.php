<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Role;
use App\Models\User;
use App\Models\WishlistItem;
use Illuminate\Database\Seeder;

class WishlistItemSeeder extends Seeder
{
    /**
     * Seed wishlist items for customer accounts.
     */
    public function run(): void
    {
        $products = Product::query()->get();

        if ($products->isEmpty()) {
            return;
        }

        $customers = User::query()
            ->whereHas('roles', fn ($query) => $query->where('slug', Role::CUSTOMER_SLUG))
            ->get();

        foreach ($customers as $customer) {
            $count = min(fake()->numberBetween(2, 5), $products->count());

            foreach ($products->random($count) as $product) {
                WishlistItem::factory()->forUser($customer)->forProduct($product)->create();
            }
        }
    }
}
