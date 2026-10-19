<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    /**
     * Seed the application's settings.
     */
    public function run(): void
    {
        $settings = [
            // General store information.
            ['store_name', 'ShopFront', 'general'],
            ['store_tagline', 'Everything you need, delivered to your door.', 'general'],
            ['store_description', 'ShopFront is a modern online store offering quality products at fair prices with fast, reliable shipping.', 'general'],
            ['store_email', 'support@shopfront.test', 'general'],
            ['store_phone', '+1 (555) 123-4567', 'general'],
            ['store_address', "123 Commerce Street, Suite 100\nSan Francisco, CA 94103\nUnited States", 'general'],
            ['store_country', 'US', 'general'],

            // Currency and formatting.
            ['currency', 'USD', 'general'],
            ['currency_symbol', '$', 'general'],
            ['currency_position', 'before', 'general'],
            ['currency_decimals', '2', 'general'],

            // Social links.
            ['facebook_url', 'https://facebook.com/shopfront', 'social'],
            ['instagram_url', 'https://instagram.com/shopfront', 'social'],
            ['twitter_url', 'https://twitter.com/shopfront', 'social'],
            ['youtube_url', 'https://youtube.com/@shopfront', 'social'],

            // Commerce behaviour.
            ['tax_rate', '8.25', 'commerce'],
            ['tax_inclusive', '0', 'commerce'],
            ['shipping_flat_rate', '9.99', 'commerce'],
            ['free_shipping_threshold', '75', 'commerce'],
            ['low_stock_threshold', '5', 'commerce'],
            ['products_per_page', '12', 'commerce'],
            ['reviews_require_approval', '1', 'commerce'],
            ['allow_guest_checkout', '1', 'commerce'],

            // Order notifications.
            ['order_notification_email', 'orders@shopfront.test', 'commerce'],
            ['send_order_confirmation', '1', 'commerce'],
        ];

        foreach ($settings as [$key, $value, $group]) {
            Setting::set($key, $value, $group);
        }
    }
}
