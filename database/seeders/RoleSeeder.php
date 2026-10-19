<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Seed the application's roles.
     */
    public function run(): void
    {
        $roles = [
            [Role::ADMIN_SLUG, 'Administrator', 'Full access to every part of the store, including settings and staff management.'],
            [Role::STAFF_SLUG, 'Staff', 'Can manage products, orders, and customers but cannot change store settings.'],
            [Role::CUSTOMER_SLUG, 'Customer', 'Registered shopper with access to their account, orders, and wishlist.'],
        ];

        foreach ($roles as [$slug, $name, $description]) {
            Role::updateOrCreate(
                ['slug' => $slug],
                ['name' => $name, 'description' => $description, 'is_system' => true],
            );
        }
    }
}
