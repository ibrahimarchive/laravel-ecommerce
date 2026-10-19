<?php

namespace App\Support;

use App\Models\Setting;

/**
 * Read-only accessor for store-wide configuration.
 *
 * Values are resolved from the database backed {@see Setting} records first
 * and fall back to the defaults declared in `config/store.php`.
 */
final class Store
{
    /**
     * Resolve a single setting value, falling back to the given default or the
     * matching `config/store.php` value.
     */
    public static function setting(string $key, mixed $default = null): mixed
    {
        $value = Setting::allSettings()->get($key);

        if ($value === null || $value === '') {
            return $default ?? config("store.{$key}");
        }

        return $value;
    }

    public static function name(): string
    {
        return (string) self::setting('store_name', config('store.name'));
    }

    public static function tagline(): string
    {
        return (string) self::setting('store_tagline', config('store.tagline'));
    }

    public static function description(): string
    {
        return (string) self::setting('store_description', config('store.description'));
    }

    public static function email(): string
    {
        return (string) self::setting('store_email', config('store.email'));
    }

    public static function phone(): string
    {
        return (string) self::setting('store_phone', config('store.phone'));
    }

    public static function address(): string
    {
        return (string) self::setting('store_address', config('store.address'));
    }

    /**
     * Social profile links keyed by network name, with empty values removed.
     *
     * @return array<string, string>
     */
    public static function socialLinks(): array
    {
        $networks = ['facebook', 'instagram', 'twitter', 'youtube'];

        $links = [];

        foreach ($networks as $network) {
            $url = self::setting("{$network}_url");

            if (is_string($url) && $url !== '') {
                $links[$network] = $url;
            }
        }

        return $links;
    }

    /**
     * @return array{code: string, symbol: string, position: string, decimals: int}
     */
    public static function currency(): array
    {
        return [
            'code' => (string) self::setting('currency', config('store.currency.code')),
            'symbol' => (string) self::setting('currency_symbol', config('store.currency.symbol')),
            'position' => (string) self::setting('currency_position', config('store.currency.position')),
            'decimals' => (int) self::setting('currency_decimals', config('store.currency.decimals')),
        ];
    }

    /**
     * Format a monetary amount using the configured currency settings.
     */
    public static function money(float|int|string|null $amount): string
    {
        $currency = self::currency();

        $formatted = number_format((float) $amount, $currency['decimals'], '.', ',');

        return $currency['position'] === 'after'
            ? $formatted.$currency['symbol']
            : $currency['symbol'].$formatted;
    }

    public static function taxRate(): float
    {
        return (float) self::setting('tax_rate', config('store.tax.rate'));
    }

    public static function taxInclusive(): bool
    {
        return self::boolean('tax_inclusive', (bool) config('store.tax.inclusive'));
    }

    public static function shippingFlatRate(): float
    {
        return (float) self::setting('shipping_flat_rate', config('store.shipping.flat_rate'));
    }

    public static function freeShippingThreshold(): float
    {
        return (float) self::setting('free_shipping_threshold', config('store.shipping.free_threshold'));
    }

    public static function productsPerPage(): int
    {
        return (int) self::setting('products_per_page', config('store.catalog.per_page'));
    }

    public static function lowStockThreshold(): int
    {
        return (int) self::setting('low_stock_threshold', config('store.catalog.low_stock_threshold'));
    }

    public static function reviewsRequireApproval(): bool
    {
        return self::boolean('reviews_require_approval', (bool) config('store.reviews.require_approval'));
    }

    public static function allowGuestCheckout(): bool
    {
        return self::boolean('allow_guest_checkout', (bool) config('store.checkout.allow_guest'));
    }

    public static function sendOrderConfirmation(): bool
    {
        return self::boolean('send_order_confirmation', true);
    }

    public static function orderNotificationEmail(): string
    {
        return (string) self::setting('order_notification_email', self::email());
    }

    public static function placeholder(string $type = 'product'): string
    {
        return (string) config("store.placeholders.{$type}", 'images/product-placeholder.svg');
    }

    /**
     * Resolve a setting as a boolean, tolerating the '1'/'0' string values
     * stored by the settings table.
     */
    private static function boolean(string $key, bool $default): bool
    {
        $value = self::setting($key);

        if ($value === null) {
            return $default;
        }

        return filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? $default;
    }
}
