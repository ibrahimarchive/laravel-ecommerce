<?php

namespace Database\Seeders;

use App\Models\NewsletterSubscriber;
use Illuminate\Database\Seeder;

class NewsletterSubscriberSeeder extends Seeder
{
    /**
     * Seed the newsletter subscriber list.
     */
    public function run(): void
    {
        NewsletterSubscriber::factory()->count(18)->create();
        NewsletterSubscriber::factory()->count(4)->inactive()->create();
    }
}
