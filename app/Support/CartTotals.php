<?php

namespace App\Support;

/**
 * Immutable value object describing the monetary breakdown of a cart or order.
 *
 * The totals are shared between the cart, checkout and order flows so the
 * money math lives in exactly one place.
 */
final readonly class CartTotals
{
    public function __construct(
        public int $itemsCount = 0,
        public float $subtotal = 0.0,
        public float $discountTotal = 0.0,
        public float $taxTotal = 0.0,
        public float $shippingTotal = 0.0,
        public float $grandTotal = 0.0,
        public ?string $couponCode = null,
    ) {}

    /**
     * Build a totals object, deriving the grand total from the component parts.
     */
    public static function make(
        int $itemsCount = 0,
        float $subtotal = 0.0,
        float $discountTotal = 0.0,
        float $taxTotal = 0.0,
        float $shippingTotal = 0.0,
        ?string $couponCode = null,
        bool $taxInclusive = false,
    ): self {
        $taxAdded = $taxInclusive ? 0.0 : $taxTotal;

        $grandTotal = round(max(0, $subtotal - $discountTotal + $taxAdded + $shippingTotal), 2);

        return new self(
            itemsCount: $itemsCount,
            subtotal: round($subtotal, 2),
            discountTotal: round($discountTotal, 2),
            taxTotal: round($taxTotal, 2),
            shippingTotal: round($shippingTotal, 2),
            grandTotal: $grandTotal,
            couponCode: $couponCode,
        );
    }

    public function isEmpty(): bool
    {
        return $this->itemsCount === 0;
    }

    public function hasDiscount(): bool
    {
        return $this->discountTotal > 0;
    }

    /**
     * @return array<string, int|float|string|null>
     */
    public function toArray(): array
    {
        return [
            'items_count' => $this->itemsCount,
            'subtotal' => $this->subtotal,
            'discount_total' => $this->discountTotal,
            'tax_total' => $this->taxTotal,
            'shipping_total' => $this->shippingTotal,
            'grand_total' => $this->grandTotal,
            'coupon_code' => $this->couponCode,
        ];
    }
}
