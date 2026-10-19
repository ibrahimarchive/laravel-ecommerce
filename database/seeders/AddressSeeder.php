<?php

namespace Database\Seeders;

use App\Models\Address;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class AddressSeeder extends Seeder
{
    /**
     * Seed saved addresses for every customer account.
     */
    public function run(): void
    {
        $customers = User::query()
            ->whereHas('roles', fn ($query) => $query->where('slug', Role::CUSTOMER_SLUG))
            ->get();

        foreach ($customers as $customer) {
            Address::factory()->forUser($customer)->default()->create([
                'label' => 'Home',
            ]);

            Address::factory()->forUser($customer)->create([
                'label' => 'Work',
            ]);
        }
    }
}
