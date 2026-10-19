<?php

namespace App\Models;

use Database\Factories\CartFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['user_id', 'session_id', 'coupon_id', 'shipping_method', 'note'])]
class Cart extends Model
{
    /** @use HasFactory<CartFactory> */
    use HasFactory;

    /**
     * Get the user who owns the cart.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the coupon applied to the cart.
     *
     * @return BelongsTo<Coupon, $this>
     */
    public function coupon(): BelongsTo
    {
        return $this->belongsTo(Coupon::class);
    }

    /**
     * Get the items in the cart.
     *
     * @return HasMany<CartItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(CartItem::class)->orderBy('id');
    }

    /**
     * Scope the query to carts owned by the given session.
     *
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    #[Scope]
    protected function forSession(Builder $query, string $sessionId): Builder
    {
        return $query->where('session_id', $sessionId);
    }

    /**
     * Determine whether the cart has no items.
     */
    public function isEmpty(): bool
    {
        return $this->items()->count() === 0;
    }

    /**
     * Get the total number of units in the cart.
     */
    public function itemCount(): int
    {
        return (int) $this->items()->sum('quantity');
    }

    /**
     * Remove every item from the cart and clear the applied coupon.
     */
    public function clear(): void
    {
        $this->items()->delete();
        $this->forceFill(['coupon_id' => null, 'shipping_method' => null])->save();
    }
}
