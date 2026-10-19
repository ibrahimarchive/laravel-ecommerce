<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Seed the application's users.
     */
    public function run(): void
    {
        $adminRoleId = Role::query()->where('slug', Role::ADMIN_SLUG)->value('id');
        $staffRoleId = Role::query()->where('slug', Role::STAFF_SLUG)->value('id');
        $customerRoleId = Role::query()->where('slug', Role::CUSTOMER_SLUG)->value('id');

        $admin = User::factory()->create([
            'name' => 'Store Administrator',
            'email' => 'admin@shopfront.test',
            'phone' => '+1 (555) 000-0001',
            'is_active' => true,
        ]);
        $admin->roles()->sync(array_filter([$adminRoleId]));

        $staff = User::factory()->create([
            'name' => 'Sam Staff',
            'email' => 'staff@shopfront.test',
            'phone' => '+1 (555) 000-0002',
            'is_active' => true,
        ]);
        $staff->roles()->sync(array_filter([$staffRoleId]));

        $customer = User::factory()->create([
            'name' => 'Casey Customer',
            'email' => 'customer@shopfront.test',
            'phone' => '+1 (555) 000-0003',
            'is_active' => true,
        ]);
        $customer->roles()->sync(array_filter([$customerRoleId]));

        User::factory(9)
            ->create()
            ->each(fn (User $user) => $user->roles()->sync(array_filter([$customerRoleId])));
    }
}
