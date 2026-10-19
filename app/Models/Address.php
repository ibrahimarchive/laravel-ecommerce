<?php

namespace App\Models;

use Database\Factories\AddressFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'user_id', 'label', 'first_name', 'last_name', 'company',
    'address_line_1', 'address_line_2', 'city', 'state',
    'postal_code', 'country', 'phone', 'is_default',
])]
class Address extends Model
{
    /** @use HasFactory<AddressFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_default' => 'boolean',
        ];
    }

    /**
     * Get the user who owns the address.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope the query to default addresses.
     *
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    #[Scope]
    protected function default(Builder $query): Builder
    {
        return $query->where('is_default', true);
    }

    /**
     * Get the full name on the address.
     */
    public function fullName(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }

    /**
     * Render the address as a single line.
     */
    public function oneLiner(): string
    {
        return collect([
            $this->address_line_1,
            $this->address_line_2,
            $this->city,
            $this->state,
            $this->postal_code,
            $this->country,
        ])->filter()->implode(', ');
    }

    /**
     * Convert the address to a plain array for order snapshots.
     *
     * @return array<string, string|null>
     */
    public function toSnapshot(): array
    {
        return [
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'company' => $this->company,
            'address_line_1' => $this->address_line_1,
            'address_line_2' => $this->address_line_2,
            'city' => $this->city,
            'state' => $this->state,
            'postal_code' => $this->postal_code,
            'country' => $this->country,
            'phone' => $this->phone,
        ];
    }

    /**
     * Make the address the default for its user and clear the previous default.
     */
    public function makeDefault(): void
    {
        $this->user->addresses()
            ->whereKeyNot($this->getKey())
            ->update(['is_default' => false]);

        $this->forceFill(['is_default' => true])->save();
    }
}
