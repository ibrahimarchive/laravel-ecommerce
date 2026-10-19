<?php

namespace App\Models;

use Database\Factories\ProductVariantFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;

#[Fillable([
    'product_id', 'name', 'sku', 'price', 'compare_price',
    'stock_quantity', 'is_active', 'sort_order',
])]
class ProductVariant extends Model
{
    /** @use HasFactory<ProductVariantFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'compare_price' => 'decimal:2',
            'stock_quantity' => 'integer',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    /**
     * Get the product the variant belongs to.
     *
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the attribute values that define the variant.
     *
     * @return BelongsToMany<AttributeValue, $this>
     */
    public function attributeValues(): BelongsToMany
    {
        return $this->belongsToMany(
            AttributeValue::class,
            'product_variant_attribute_value',
            'product_variant_id',
            'attribute_value_id',
        );
    }

    /**
     * Scope the query to active variants.
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
     * Get the effective price, inheriting from the parent product when unset.
     */
    public function effectivePrice(): float
    {
        return (float) ($this->price ?? $this->product->price);
    }

    /**
     * Get the effective compare-at price, inheriting from the parent product when unset.
     */
    public function effectiveComparePrice(): ?float
    {
        $compare = $this->compare_price ?? $this->product->compare_price;

        return $compare === null ? null : (float) $compare;
    }

    /**
     * Determine whether the variant is discounted.
     */
    public function isOnSale(): bool
    {
        $compare = $this->effectiveComparePrice();

        return $compare !== null && $compare > $this->effectivePrice();
    }

    /**
     * Build a human readable label from the assigned attribute values.
     */
    public function label(): string
    {
        if ($this->name !== null && $this->name !== '') {
            return $this->name;
        }

        $values = $this->relationLoaded('attributeValues')
            ? $this->attributeValues->pluck('value')
            : $this->attributeValues()->pluck('value');

        return $values->isEmpty() ? $this->sku : $values->implode(' / ');
    }

    /**
     * Generate a unique SKU for the given base.
     */
    public static function generateSku(string $base, ?int $ignoreId = null): string
    {
        $base = Str::upper(Str::slug($base, '-'));
        $sku = $base;
        $suffix = 2;

        while (self::query()
            ->where('sku', $sku)
            ->when($ignoreId !== null, fn (Builder $query) => $query->whereKeyNot($ignoreId))
            ->exists()
        ) {
            $sku = "{$base}-{$suffix}";
            $suffix++;
        }

        return $sku;
    }
}
