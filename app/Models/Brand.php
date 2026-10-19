<?php

namespace App\Models;

use Database\Factories\BrandFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

#[Fillable([
    'name', 'slug', 'description', 'logo', 'website',
    'is_active', 'is_featured', 'sort_order',
])]
class Brand extends Model
{
    /** @use HasFactory<BrandFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    /**
     * Get the products belonging to the brand.
     *
     * @return HasMany<Product, $this>
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    /**
     * Scope the query to active brands.
     *
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    #[Scope]
    protected function active(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope the query to featured brands.
     *
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    #[Scope]
    protected function featured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope the query to an ordered, deterministic sequence.
     *
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    #[Scope]
    protected function ordered(Builder $query): Builder
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }

    /**
     * Generate a unique slug from the given name.
     */
    public static function generateSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $suffix = 2;

        while (self::query()
            ->where('slug', $slug)
            ->when($ignoreId !== null, fn (Builder $query) => $query->whereKeyNot($ignoreId))
            ->exists()
        ) {
            $slug = "{$base}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }
}
