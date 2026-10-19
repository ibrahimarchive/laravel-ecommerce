<?php

namespace App\Services;

use App\Support\Store;

/**
 * Resolves the available shipping methods and their rates.
 */
final class ShippingService
{
    public const STANDARD = 'standard';

    public const EXPRESS = 'express';

    public const PICKUP = 'pickup';

    /**
     * Available shipping methods with their configured rates.
     *
     * @return array<int, array{value: string, label: string, description: string, rate: float}>
     */
    public function methods(): array
    {
        $flat = Store::shippingFlatRate();

        return [
            ['value' => self::STANDARD, 'label' => 'Standard Shipping', 'description' => '5-7 business days', 'rate' => round($flat, 2)],
            ['value' => self::EXPRESS, 'label' => 'Express Shipping', 'description' => '2-3 business days', 'rate' => round($flat * 2, 2)],
            ['value' => self::PICKUP, 'label' => 'Store Pickup', 'description' => 'Ready within 24 hours', 'rate' => 0.0],
        ];
    }

    /**
     * @return array<int, string>
     */
    public function methodKeys(): array
    {
        return array_column($this->methods(), 'value');
    }

    public function isValidMethod(?string $method): bool
    {
        return $method !== null && in_array($method, $this->methodKeys(), true);
    }

    public function labelFor(?string $method): string
    {
        foreach ($this->methods() as $definition) {
            if ($definition['value'] === $method) {
                return $definition['label'];
            }
        }

        return 'Standard Shipping';
    }

    /**
     * Resolve the shipping rate for a method given the taxable subtotal.
     */
    public function rateFor(?string $method, float $subtotal): float
    {
        $method = $this->isValidMethod($method) ? $method : self::STANDARD;

        if ($method === self::PICKUP) {
            return 0.0;
        }

        $rate = 0.0;

        foreach ($this->methods() as $definition) {
            if ($definition['value'] === $method) {
                $rate = $definition['rate'];
            }
        }

        $threshold = Store::freeShippingThreshold();

        if ($method === self::STANDARD && $threshold > 0 && $subtotal >= $threshold) {
            return 0.0;
        }

        return round($rate, 2);
    }

    /**
     * Amount remaining before free standard shipping is unlocked.
     */
    public function amountUntilFreeShipping(float $subtotal): float
    {
        $threshold = Store::freeShippingThreshold();

        if ($threshold <= 0 || $subtotal >= $threshold) {
            return 0.0;
        }

        return round($threshold - $subtotal, 2);
    }
}
