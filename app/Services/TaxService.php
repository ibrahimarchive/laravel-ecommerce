<?php

namespace App\Services;

use App\Support\Store;

/**
 * Calculates sales tax for cart and order totals.
 */
final class TaxService
{
    public function rate(): float
    {
        return Store::taxRate();
    }

    public function isInclusive(): bool
    {
        return Store::taxInclusive();
    }

    /**
     * Calculate the tax contained in, or due on, the given amount.
     */
    public function calculate(float $amount): float
    {
        if ($amount <= 0) {
            return 0.0;
        }

        $rate = $this->rate() / 100;

        if ($rate <= 0) {
            return 0.0;
        }

        if ($this->isInclusive()) {
            return round($amount - ($amount / (1 + $rate)), 2);
        }

        return round($amount * $rate, 2);
    }

    /**
     * The tax to add on top of the given amount, honouring inclusive pricing.
     */
    public function additionFor(float $amount): float
    {
        return $this->isInclusive() ? 0.0 : $this->calculate($amount);
    }
}
