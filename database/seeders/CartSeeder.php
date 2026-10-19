<?php

namespace Database\Seeders;

use App\Models\Cart;
use App\Models\Product;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class CartSeeder extends Seeder
{
    /**
     * Seed a handful of active carts, including guest and customer carts.
     */
    public function run(): void
    {
        if (Product::query()->doesntExist()) {
            return;
        }

        Cart::factory()->count(3)->create();

        $customers = User::query()
            ->whereHas('roles', fn ($query) => $query->where('slug', Role::CUSTOMER_SLUG))
            ->inRandomOrder()
            ->limit(4)
            ->get();

        foreach ($customers as $customer) {
            Cart::factory()->forUser($customer)->create([
                'session_id' => null,
            ]);
        }
    }
}
