<?php

namespace App\Models;

use App\Enums\DiscountType;
use Database\Factories\CouponFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

#[Fillable([
    'code', 'name', 'description', 'type', 'value', 'min_order_total',
    'max_discount_amount', 'usage_limit', 'usage_limit_per_user',
    'is_active', 'starts_at', 'expires_at',
])]
class Coupon extends Model
{
    /** @use HasFactory<CouponFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => DiscountType::class,
            'value' => 'decimal:2',
            'min_order_total' => 'decimal:2',
            'max_discount_amount' => 'decimal:2',
            'usage_limit' => 'integer',
            'usage_limit_per_user' => 'integer',
            'used_count' => 'integer',
            'is_active' => 'boolean',
            'starts_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    /**
     * Normalise the coupon code to upper case when it is set.
     */
    protected function code(): Attribute
    {
        return Attribute::make(
            set: fn (string $value): string => Str::upper(trim($value)),
        );
    }

    /**
     * Get the orders that used the coupon.
     *
     * @return HasMany<Order, $this>
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Scope the query to active coupons within their validity window.
     *
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    #[Scope]
    protected function active(Builder $query): Builder
    {
        return $query
            ->where('is_active', true)
            ->where(fn (Builder $query) => $query
                ->whereNull('starts_at')
                ->orWhere('starts_at', '<=', now()))
            ->where(fn (Builder $query) => $query
                ->whereNull('expires_at')
                ->orWhere('expires_at', '>=', now()));
    }

    /**
     * Determine whether the coupon is currently redeemable.
     */
    public function isRedeemable(): bool
    {
        if (! $this->is_active) {
            return false;
        }

        if ($this->starts_at !== null && $this->starts_at->isFuture()) {
            return false;
        }

        if ($this->expires_at !== null && $this->expires_at->isPast()) {
            return false;
        }

        if ($this->usage_limit !== null && $this->used_count >= $this->usage_limit) {
            return false;
        }

        return true;
    }

    /**
     * Determine whether the coupon meets the minimum order total.
     */
    public function meetsMinimum(float $subtotal): bool
    {
        if ($this->min_order_total === null) {
            return true;
        }

        return $subtotal >= (float) $this->min_order_total;
    }

    /**
     * Calculate the discount this coupon applies to the given subtotal.
     */
    public function discountFor(float $subtotal): float
    {
        if (! $this->meetsMinimum($subtotal)) {
            return 0.0;
        }

        return $this->type->calculateDiscount(
            $subtotal,
            (float) $this->value,
            $this->max_discount_amount === null ? null : (float) $this->max_discount_amount,
        );
    }

    /**
     * Determine how many times the given user has redeemed the coupon.
     */
    public function usageCountForUser(int $userId): int
    {
        return $this->orders()->where('user_id', $userId)->count();
    }

    /**
     * Get a human readable description of the coupon value.
     */
    public function valueLabel(): string
    {
        return $this->type === DiscountType::Percentage
            ? rtrim(rtrim((string) $this->value, '0'), '.').'%'
            : '$'.number_format((float) $this->value, 2);
    }
}
