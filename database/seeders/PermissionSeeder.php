<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    /**
     * Seed the application's permissions and grant them to the default roles.
     */
    public function run(): void
    {
        $permissions = [
            // Products.
            ['products.view', 'View products', 'products'],
            ['products.create', 'Create products', 'products'],
            ['products.update', 'Update products', 'products'],
            ['products.delete', 'Delete products', 'products'],

            // Catalog.
            ['categories.manage', 'Manage categories', 'catalog'],
            ['brands.manage', 'Manage brands', 'catalog'],
            ['attributes.manage', 'Manage attributes', 'catalog'],

            // Orders.
            ['orders.view', 'View orders', 'orders'],
            ['orders.update', 'Update order status', 'orders'],
            ['orders.delete', 'Delete orders', 'orders'],

            // Customers.
            ['customers.view', 'View customers', 'customers'],
            ['customers.manage', 'Manage customers', 'customers'],

            // Marketing.
            ['coupons.manage', 'Manage coupons', 'marketing'],
            ['reviews.moderate', 'Moderate reviews', 'marketing'],
            ['newsletter.manage', 'Manage newsletter subscribers', 'marketing'],

            // Content.
            ['pages.manage', 'Manage pages', 'content'],

            // Administration.
            ['settings.manage', 'Manage store settings', 'administration'],
            ['reports.view', 'View reports', 'administration'],
        ];

        foreach ($permissions as [$slug, $name, $group]) {
            Permission::updateOrCreate(
                ['slug' => $slug],
                ['name' => $name, 'group' => $group],
            );
        }

        /** @var Role|null $admin */
        $admin = Role::query()->where('slug', Role::ADMIN_SLUG)->first();

        $admin?->grantPermissions(Permission::query()->pluck('id')->all());

        /** @var Role|null $staff */
        $staff = Role::query()->where('slug', Role::STAFF_SLUG)->first();

        $staffPermissions = [
            'products.view', 'products.create', 'products.update',
            'categories.manage', 'brands.manage', 'attributes.manage',
            'orders.view', 'orders.update',
            'customers.view',
            'coupons.manage', 'reviews.moderate', 'newsletter.manage',
            'pages.manage', 'reports.view',
        ];

        $staff?->grantPermissions(
            Permission::query()->whereIn('slug', $staffPermissions)->pluck('id')->all(),
        );
    }
}
