<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            SettingSeeder::class,
            RoleSeeder::class,
            PermissionSeeder::class,
            UserSeeder::class,
            CategorySeeder::class,
            BrandSeeder::class,
            AttributeSeeder::class,
            AttributeValueSeeder::class,
            ProductSeeder::class,
            CouponSeeder::class,
            PageSeeder::class,
            AddressSeeder::class,
            ReviewSeeder::class,
            WishlistItemSeeder::class,
            CartSeeder::class,
            CartItemSeeder::class,
            OrderSeeder::class,
            OrderItemSeeder::class,
            OrderStatusHistorySeeder::class,
            NewsletterSubscriberSeeder::class,
            ContactMessageSeeder::class,
        ]);
    }
}
