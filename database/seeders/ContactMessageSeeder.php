<?php

namespace Database\Seeders;

use App\Models\ContactMessage;
use Illuminate\Database\Seeder;

class ContactMessageSeeder extends Seeder
{
    /**
     * Seed enquiries submitted through the contact form.
     */
    public function run(): void
    {
        ContactMessage::factory()->count(10)->create();
        ContactMessage::factory()->count(4)->read()->create();
        ContactMessage::factory()->count(3)->replied()->create();
    }
}
