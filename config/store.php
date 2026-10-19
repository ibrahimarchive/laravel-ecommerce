<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Store Identity
    |--------------------------------------------------------------------------
    |
    | Defaults for the storefront identity. These values act as fallbacks for
    | the database backed settings managed through the admin panel.
    |
    */

    'name' => env('STORE_NAME', 'ShopFront'),

    'tagline' => env('STORE_TAGLINE', 'Everything you need, delivered.'),

    'description' => env('STORE_DESCRIPTION', 'A modern online store built with Laravel.'),

    'email' => env('STORE_EMAIL', 'support@shopfront.test'),

    'phone' => env('STORE_PHONE', '+1 (555) 000-0000'),

    'address' => env('STORE_ADDRESS', '123 Market Street, San Francisco, CA 94103'),

    'country' => env('STORE_COUNTRY', 'US'),

    /*
    |--------------------------------------------------------------------------
    | Currency
    |--------------------------------------------------------------------------
    |
    | Currency configuration used by the money formatting helpers and the
    | order/cart totals calculations throughout the application.
    |
    */

    'currency' => [
        'code' => env('STORE_CURRENCY', 'USD'),
        'symbol' => env('STORE_CURRENCY_SYMBOL', '$'),
        'position' => env('STORE_CURRENCY_POSITION', 'before'),
        'decimals' => (int) env('STORE_CURRENCY_DECIMALS', 2),
    ],

    /*
    |--------------------------------------------------------------------------
    | Tax
    |--------------------------------------------------------------------------
    |
    | Tax rate expressed as a percentage. When `inclusive` is true the catalog
    | prices are treated as already containing tax.
    |
    */

    'tax' => [
        'rate' => (float) env('STORE_TAX_RATE', 8.25),
        'inclusive' => (bool) env('STORE_TAX_INCLUSIVE', false),
    ],

    /*
    |--------------------------------------------------------------------------
    | Shipping
    |--------------------------------------------------------------------------
    |
    | Flat rate shipping applied at checkout, waived once the order subtotal
    | reaches the configured free shipping threshold.
    |
    */

    'shipping' => [
        'flat_rate' => (float) env('STORE_SHIPPING_FLAT_RATE', 9.99),
        'free_threshold' => (float) env('STORE_FREE_SHIPPING_THRESHOLD', 75.00),
    ],

    /*
    |--------------------------------------------------------------------------
    | Catalog
    |--------------------------------------------------------------------------
    */

    'catalog' => [
        'per_page' => (int) env('STORE_PRODUCTS_PER_PAGE', 12),
        'low_stock_threshold' => (int) env('STORE_LOW_STOCK_THRESHOLD', 5),
    ],

    /*
    |--------------------------------------------------------------------------
    | Reviews
    |--------------------------------------------------------------------------
    */

    'reviews' => [
        'require_approval' => (bool) env('STORE_REVIEWS_REQUIRE_APPROVAL', true),
    ],

    /*
    |--------------------------------------------------------------------------
    | Checkout
    |--------------------------------------------------------------------------
    */

    'checkout' => [
        'allow_guest' => (bool) env('STORE_ALLOW_GUEST_CHECKOUT', true),
    ],

    /*
    |--------------------------------------------------------------------------
    | Placeholders
    |--------------------------------------------------------------------------
    */

    'placeholders' => [
        'product' => 'images/product-placeholder.svg',
        'avatar' => 'images/avatar-placeholder.svg',
    ],

];
