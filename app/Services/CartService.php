<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use App\Support\CartTotals;

/**
 * Owns the lifecycle of a shopping cart: resolving the active cart, mutating
 * its contents and deriving its monetary totals.
 */
final class CartService
{
    public function __construct(
        private readonly TaxService $tax,
        private readonly ShippingService $shipping,
        private readonly DiscountService $discounts,
    ) {}

    public function forUser(User $user): Cart
    {
        return Cart::query()->firstOrCreate(['user_id' => $user->id]);
    }

    public function forSession(string $sessionId): Cart
    {
        return Cart::query()->firstOrCreate([
            'session_id' => $sessionId,
            'user_id' => null,
        ]);
    }

    public function current(?User $user, string $sessionId): Cart
    {
        return $user ? $this->forUser($user) : $this->forSession($sessionId);
    }

    /**
     * Find an existing cart without creating one.
     */
    public function find(?User $user, string $sessionId): ?Cart
    {
        if ($user) {
            return Cart::query()->where('user_id', $user->id)->first();
        }

        return Cart::query()
            ->whereNull('user_id')
            ->where('session_id', $sessionId)
            ->first();
    }

    /**
     * Move the items of a guest cart into the authenticated user's cart.
     */
    public function mergeGuestCart(User $user, string $sessionId): void
    {
        $guest = Cart::query()->whereNull('user_id')->where('session_id', $sessionId)->first();

        if (! $guest) {
            return;
        }

        $cart = $this->forUser($user);
        $cart->load('items');

        foreach ($guest->items as $item) {
            $existing = $cart->items->first(
                fn (CartItem $candidate) => $candidate->product_id === $item->product_id
                    && $candidate->product_variant_id === $item->product_variant_id
            );

            if ($existing) {
                $existing->forceFill(['quantity' => $existing->quantity + $item->quantity])->save();
            } else {
                $item->forceFill(['cart_id' => $cart->id])->save();
            }
        }

        if ($cart->coupon_id === null && $guest->coupon_id !== null) {
            $cart->forceFill(['coupon_id' => $guest->coupon_id])->save();
        }

        $guest->delete();
    }

    public function add(Cart $cart, Product $product, ?ProductVariant $variant = null, int $quantity = 1): CartItem
    {
        $quantity = max(1, $quantity);
        $unitPrice = $this->unitPriceFor($product, $variant);

        $item = $cart->items()
            ->where('product_id', $product->id)
            ->where('product_variant_id', $variant?->id)
            ->first();

        if ($item) {
            $item->forceFill([
                'quantity' => $item->quantity + $quantity,
                'unit_price' => $unitPrice,
            ])->save();

            return $item->refresh();
        }

        return $cart->items()->create([
            'product_id' => $product->id,
            'product_variant_id' => $variant?->id,
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
        ]);
    }

    public function updateItem(CartItem $item, int $quantity): ?CartItem
    {
        if ($quantity <= 0) {
            $item->delete();

            return null;
        }

        $item->forceFill(['quantity' => $quantity])->save();

        return $item->refresh();
    }

    public function removeItem(CartItem $item): void
    {
        $item->delete();
    }

    public function clear(Cart $cart): void
    {
        $cart->clear();
    }

    /**
     * Validate and attach a coupon code to the cart.
     */
    public function applyCoupon(Cart $cart, ?string $code): Cart
    {
        $coupon = $this->discounts->validate($code, $this->subtotal($cart), $cart->user);

        $cart->forceFill(['coupon_id' => $coupon?->id])->save();

        return $cart->load(['coupon', 'items']);
    }

    public function removeCoupon(Cart $cart): Cart
    {
        $cart->forceFill(['coupon_id' => null])->save();

        return $cart->load(['coupon', 'items']);
    }

    public function setShippingMethod(Cart $cart, ?string $method): Cart
    {
        $method = $this->shipping->isValidMethod($method) ? $method : ShippingService::STANDARD;

        $cart->forceFill(['shipping_method' => $method])->save();

        return $cart;
    }

    public function subtotal(Cart $cart): float
    {
        $cart->loadMissing('items');

        $subtotal = $cart->items->sum(
            fn (CartItem $item) => (float) $item->unit_price * $item->quantity
        );

        return round((float) $subtotal, 2);
    }

    /**
     * Derive the full monetary breakdown for a cart.
     */
    public function totals(Cart $cart): CartTotals
    {
        $cart->loadMissing(['items', 'coupon']);

        $itemsCount = 0;
        $subtotal = 0.0;

        foreach ($cart->items as $item) {
            $itemsCount += $item->quantity;
            $subtotal += (float) $item->unit_price * $item->quantity;
        }

        $subtotal = round($subtotal, 2);

        $coupon = $cart->coupon;
        $discount = $this->discounts->discountFor($coupon, $subtotal);

        $taxable = round(max(0, $subtotal - $discount), 2);
        $taxTotal = $this->tax->calculate($taxable);
        $shippingTotal = $this->shipping->rateFor($cart->shipping_method, $taxable);

        return CartTotals::make(
            itemsCount: $itemsCount,
            subtotal: $subtotal,
            discountTotal: $discount,
            taxTotal: $taxTotal,
            shippingTotal: $shippingTotal,
            couponCode: $discount > 0 ? $coupon?->code : null,
            taxInclusive: $this->tax->isInclusive(),
        );
    }

    /**
     * @return array<int, array{value: string, label: string, description: string, rate: float}>
     */
    public function shippingMethods(): array
    {
        return $this->shipping->methods();
    }

    private function unitPriceFor(Product $product, ?ProductVariant $variant): float
    {
        if ($variant !== null) {
            return round((float) $variant->effectivePrice(), 2);
        }

        return round((float) $product->price, 2);
    }
}
