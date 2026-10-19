<?php

namespace App\Enums;

enum DiscountType: string
{
    case Fixed = 'fixed';
    case Percentage = 'percentage';

    /**
     * Get the human readable label for the discount type.
     */
    public function label(): string
    {
        return match ($this) {
            self::Fixed => 'Fixed Amount',
            self::Percentage => 'Percentage',
        };
    }

    /**
     * Calculate the discount for the given order subtotal, capped by an optional maximum.
     */
    public function calculateDiscount(float $subtotal, float $value, ?float $maxDiscount = null): float
    {
        $discount = match ($this) {
            self::Fixed => $value,
            self::Percentage => $subtotal * ($value / 100),
        };

        if ($maxDiscount !== null) {
            $discount = min($discount, $maxDiscount);
        }

        return round(min($discount, $subtotal), 2);
    }

    /**
     * Get every type as a value/label pair for form selects.
     *
     * @return array<int, array<string, string>>
     */
    public static function options(): array
    {
        return array_map(
            fn (self $type) => ['value' => $type->value, 'label' => $type->label()],
            self::cases(),
        );
    }
}
