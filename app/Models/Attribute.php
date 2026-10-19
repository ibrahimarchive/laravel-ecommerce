<?php

namespace App\Models;

use Database\Factories\AttributeFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

#[Fillable(['name', 'slug', 'type', 'is_filterable', 'is_variation', 'sort_order'])]
class Attribute extends Model
{
    /** @use HasFactory<AttributeFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_filterable' => 'boolean',
            'is_variation' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    /**
     * Get the values belonging to the attribute.
     *
     * @return HasMany<AttributeValue, $this>
     */
    public function values(): HasMany
    {
        return $this->hasMany(AttributeValue::class)->orderBy('sort_order');
    }

    /**
     * Scope the query to attributes that can be used as storefront filters.
     *
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    #[Scope]
    protected function filterable(Builder $query): Builder
    {
        return $query->where('is_filterable', true);
    }

    /**
     * Scope the query to attributes that generate product variants.
     *
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    #[Scope]
    protected function variation(Builder $query): Builder
    {
        return $query->where('is_variation', true);
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
