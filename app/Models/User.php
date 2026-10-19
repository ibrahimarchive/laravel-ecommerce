<?php

namespace App\Models;

use App\Enums\OrderStatus;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password', 'phone', 'avatar', 'is_active'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'last_login_at' => 'datetime',
        ];
    }

    /**
     * Get the roles assigned to the user.
     *
     * @return BelongsToMany<Role, $this>
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class)->withTimestamps();
    }

    /**
     * Get the orders placed by the user.
     *
     * @return HasMany<Order, $this>
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Get the addresses saved by the user.
     *
     * @return HasMany<Address, $this>
     */
    public function addresses(): HasMany
    {
        return $this->hasMany(Address::class);
    }

    /**
     * Get the user's active cart.
     *
     * @return HasOne<Cart, $this>
     */
    public function cart(): HasOne
    {
        return $this->hasOne(Cart::class);
    }

    /**
     * Get the products saved to the user's wishlist.
     *
     * @return HasMany<WishlistItem, $this>
     */
    public function wishlistItems(): HasMany
    {
        return $this->hasMany(WishlistItem::class);
    }

    /**
     * Get the reviews written by the user.
     *
     * @return HasMany<Review, $this>
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Determine whether the user holds the given role.
     */
    public function hasRole(string $role): bool
    {
        return $this->roles->contains('slug', $role);
    }

    /**
     * Determine whether the user holds any of the given roles.
     *
     * @param  array<int, string>  $roles
     */
    public function hasAnyRole(array $roles): bool
    {
        return $this->roles->whereIn('slug', $roles)->isNotEmpty();
    }

    /**
     * Determine whether the user holds the given permission through any role.
     */
    public function hasPermission(string $permission): bool
    {
        if ($this->hasRole(Role::ADMIN_SLUG)) {
            return true;
        }

        return $this->roles
            ->flatMap(fn (Role $role) => $role->permissions)
            ->contains('slug', $permission);
    }

    /**
     * Determine whether the user may access the administration panel.
     */
    public function isAdmin(): bool
    {
        return $this->hasAnyRole([Role::ADMIN_SLUG, Role::STAFF_SLUG]);
    }

    /**
     * Get the number of open orders belonging to the user.
     */
    public function openOrdersCount(): int
    {
        return $this->orders()
            ->whereIn('status', [
                OrderStatus::Pending->value,
                OrderStatus::Processing->value,
                OrderStatus::Shipped->value,
            ])
            ->count();
    }
}
