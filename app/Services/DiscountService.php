<?php

namespace App\Services;

use App\Models\Coupon;
use App\Models\User;
use App\Support\Store;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Validates coupon codes and resolves their discount values.
 */
final class DiscountService
{
    /**
     * Validate a coupon code against the current cart subtotal.
     *
     * @throws ValidationException
     */
    public function validate(?string $code, float $subtotal, ?User $user = null): ?Coupon
    {
        if ($code === null || trim($code) === '') {
            return null;
        }

        $coupon = Coupon::query()->where('code', Str::upper(trim($code)))->first();

        if (! $coupon) {
            $this->fail('This coupon code is not valid.');
        }

        if (! $coupon->isRedeemable()) {
            $this->fail('This coupon is no longer available.');
        }

        if (! $coupon->meetsMinimum($subtotal)) {
            $this->fail('This coupon requires a minimum order of '.Store::money($coupon->min_order_total).'.');
        }

        if ($user !== null
            && $coupon->usage_limit_per_user !== null
            && $coupon->usageCountForUser($user->id) >= $coupon->usage_limit_per_user) {
            $this->fail('You have already used this coupon the maximum number of times.');
        }

        return $coupon;
    }

    /**
     * Resolve the discount amount for a coupon against a subtotal.
     */
    public function discountFor(?Coupon $coupon, float $subtotal): float
    {
        if ($coupon === null || ! $coupon->isRedeemable() || ! $coupon->meetsMinimum($subtotal)) {
            return 0.0;
        }

        return $coupon->discountFor($subtotal);
    }

    /**
     * @throws ValidationException
     */
    private function fail(string $message): never
    {
        throw ValidationException::withMessages(['coupon' => $message]);
    }
}
