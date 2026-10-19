<?php

namespace Database\Seeders;

use App\Enums\DiscountType;
use App\Models\Coupon;
use Illuminate\Database\Seeder;

class CouponSeeder extends Seeder
{
    /**
     * Seed the store's discount coupons.
     */
    public function run(): void
    {
        $coupons = [
            [
                'code' => 'WELCOME10',
                'name' => 'Welcome 10% Off',
                'description' => 'New customers save 10% on their first order.',
                'type' => DiscountType::Percentage,
                'value' => 10,
                'min_order_total' => null,
                'max_discount_amount' => 50,
                'usage_limit' => null,
                'usage_limit_per_user' => 1,
                'starts_at' => now()->subMonth(),
                'expires_at' => now()->addYear(),
            ],
            [
                'code' => 'SAVE20',
                'name' => 'Save $20',
                'description' => 'Get $20 off any order over $100.',
                'type' => DiscountType::Fixed,
                'value' => 20,
                'min_order_total' => 100,
                'max_discount_amount' => null,
                'usage_limit' => null,
                'usage_limit_per_user' => null,
                'starts_at' => now()->subWeek(),
                'expires_at' => now()->addMonths(6),
            ],
            [
                'code' => 'SUMMER15',
                'name' => 'Summer Sale 15%',
                'description' => 'Seasonal promotion — 15% off, capped at $75.',
                'type' => DiscountType::Percentage,
                'value' => 15,
                'min_order_total' => 50,
                'max_discount_amount' => 75,
                'usage_limit' => 500,
                'usage_limit_per_user' => 2,
                'starts_at' => now()->subDay(),
                'expires_at' => now()->addMonths(3),
            ],
            [
                'code' => 'VIP50',
                'name' => 'VIP $50 Reward',
                'description' => '$50 off orders over $300 for our best customers.',
                'type' => DiscountType::Fixed,
                'value' => 50,
                'min_order_total' => 300,
                'max_discount_amount' => null,
                'usage_limit' => 100,
                'usage_limit_per_user' => 1,
                'starts_at' => now()->subDay(),
                'expires_at' => now()->addMonths(2),
            ],
            [
                'code' => 'WINTER10',
                'name' => 'Winter Warmers 10%',
                'description' => 'Expired seasonal promotion retained for reference.',
                'type' => DiscountType::Percentage,
                'value' => 10,
                'min_order_total' => null,
                'max_discount_amount' => 40,
                'usage_limit' => null,
                'usage_limit_per_user' => null,
                'is_active' => false,
                'starts_at' => now()->subYear(),
                'expires_at' => now()->subMonth(),
            ],
        ];

        foreach ($coupons as $attributes) {
            Coupon::factory()->create($attributes);
        }
    }
}
