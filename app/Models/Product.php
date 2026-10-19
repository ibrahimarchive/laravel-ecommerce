<?php

namespace App\Models;

use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute as AttributeCast;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

#[Fillable([
    'category_id', 'brand_id', 'name', 'slug', 'sku', 'short_description', 'description',
    'price', 'compare_price', 'cost_price', 'stock_quantity', 'low_stock_threshold',
    'manage_stock', 'is_active', 'is_featured', 'weight', 'meta_title',
    'meta_description', 'published_at',
])]
class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory, SoftDeletes;

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
            'cost_price' => 'decimal:2',
            'weight' => 'decimal:3',
            'stock_quantity' => 'integer',
            'low_stock_threshold' => 'integer',
            'manage_stock' => 'boolean',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'published_at' => 'datetime',
        ];
    }

    /**
     * Get the category the product belongs to.
     *
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the brand the product belongs to.
     *
     * @return BelongsTo<Brand, $this>
     */
    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    /**
     * Get the images belonging to the product.
     *
     * @return HasMany<ProductImage, $this>
     */
    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order')->orderBy('id');
    }

    /**
     * Get the primary image of the product.
     *
     * @return HasOne<ProductImage, $this>
     */
    public function primaryImage(): HasOne
    {
        return $this->hasOne(ProductImage::class)
            ->where('is_primary', true)
            ->orderBy('sort_order');
    }

    /**
     * Get the variants belonging to the product.
     *
     * @return HasMany<ProductVariant, $this>
     */
    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class)->orderBy('sort_order')->orderBy('id');
    }

    /**
     * Get the attribute values assigned to the product.
     *
     * @return BelongsToMany<AttributeValue, $this>
     */
    public function attributeValues(): BelongsToMany
    {
        return $this->belongsToMany(AttributeValue::class);
    }

    /**
     * Get every review for the product.
     *
     * @return HasMany<Review, $this>
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Get the approved reviews for the product.
     *
     * @return HasMany<Review, $this>
     */
    public function approvedReviews(): HasMany
    {
        return $this->hasMany(Review::class)->where('is_approved', true);
    }

    /**
     * Get the wishlist entries referencing the product.
     *
     * @return HasMany<WishlistItem, $this>
     */
    public function wishlistItems(): HasMany
    {
        return $this->hasMany(WishlistItem::class);
    }

    /**
     * Get the order items referencing the product.
     *
     * @return HasMany<OrderItem, $this>
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Scope the query to products visible in the storefront.
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
     * Scope the query to products that have been published.
     *
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    #[Scope]
    protected function published(Builder $query): Builder
    {
        return $query->where(fn (Builder $query) => $query
            ->whereNull('published_at')
            ->orWhere('published_at', '<=', now()));
    }

    /**
     * Scope the query to products purchasable in the storefront.
     *
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    #[Scope]
    protected function purchasable(Builder $query): Builder
    {
        return $query->active()->published();
    }

    /**
     * Scope the query to featured products.
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
     * Scope the query to products on sale.
     *
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    #[Scope]
    protected function onSale(Builder $query): Builder
    {
        return $query->whereNotNull('compare_price')
            ->whereColumn('compare_price', '>', 'price');
    }

    /**
     * Scope the query to products tracked by inventory.
     *
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    #[Scope]
    protected function managesStock(Builder $query): Builder
    {
        return $query->where('manage_stock', true);
    }

    /**
     * Scope the query to in-stock products.
     *
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    #[Scope]
    protected function inStock(Builder $query): Builder
    {
        return $query->where(fn (Builder $query) => $query
            ->where('manage_stock', false)
            ->orWhere('stock_quantity', '>', 0));
    }

    /**
     * Scope the query to products matching a free text search term.
     *
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    #[Scope]
    protected function search(Builder $query, string $term): Builder
    {
        $like = '%'.Str::lower(trim($term)).'%';

        return $query->where(fn (Builder $query) => $query
            ->whereRaw('LOWER(name) LIKE ?', [$like])
            ->orWhereRaw('LOWER(short_description) LIKE ?', [$like])
            ->orWhereRaw('LOWER(description) LIKE ?', [$like])
            ->orWhereRaw('LOWER(sku) LIKE ?', [$like]));
    }

    /**
     * Scope the query to products within a price range.
     *
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    #[Scope]
    protected function priceBetween(Builder $query, ?float $min, ?float $max): Builder
    {
        return $query
            ->when($min !== null, fn (Builder $query) => $query->where('price', '>=', $min))
            ->when($max !== null, fn (Builder $query) => $query->where('price', '<=', $max));
    }

    /**
     * Scope the query to include the review aggregate columns used by listings.
     *
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    #[Scope]
    protected function withReviewStats(Builder $query): Builder
    {
        return $query
            ->withCount(['approvedReviews as reviews_count'])
            ->withAvg(['approvedReviews as reviews_avg_rating'], 'rating');
    }

    /**
     * Apply a deterministic sort to the query.
     *
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    #[Scope]
    protected function sortBy(Builder $query, string $sort): Builder
    {
        return match ($sort) {
            'price_asc' => $query->orderBy('price')->orderBy('id'),
            'price_desc' => $query->orderByDesc('price')->orderByDesc('id'),
            'name_asc' => $query->orderBy('name')->orderBy('id'),
            'name_desc' => $query->orderByDesc('name')->orderByDesc('id'),
            'rating' => $query->orderByDesc('reviews_avg_rating')->orderByDesc('id'),
            'popular' => $query->orderByDesc('reviews_count')->orderByDesc('id'),
            default => $query->orderByDesc('created_at')->orderByDesc('id'),
        };
    }

    /**
     * Determine whether the product uses variants for pricing and stock.
     */
    public function hasVariants(): bool
    {
        return $this->variants->isNotEmpty();
    }

    /**
     * Get the lowest price across the product and its active variants.
     */
    public function lowestPrice(): float
    {
        $prices = $this->variants
            ->where('is_active', true)
            ->map(fn (ProductVariant $variant) => (float) ($variant->price ?? $this->price));

        return (float) min($prices->push((float) $this->price)->all());
    }

    /**
     * Get the highest price across the product and its active variants.
     */
    public function highestPrice(): float
    {
        $prices = $this->variants
            ->where('is_active', true)
            ->map(fn (ProductVariant $variant) => (float) ($variant->price ?? $this->price));

        return (float) max($prices->push((float) $this->price)->all());
    }

    /**
     * Get the total sellable stock across the product and its active variants.
     */
    public function totalStock(): int
    {
        if ($this->hasVariants()) {
            return (int) $this->variants
                ->where('is_active', true)
                ->sum('stock_quantity');
        }

        return (int) $this->stock_quantity;
    }

    /**
     * Determine whether the product can be purchased in the given quantity.
     */
    public function isInStock(int $quantity = 1): bool
    {
        if (! $this->manage_stock) {
            return true;
        }

        return $this->totalStock() >= $quantity;
    }

    /**
     * Determine whether stock has fallen to or below the low stock threshold.
     */
    public function isLowStock(): bool
    {
        if (! $this->manage_stock || $this->hasVariants()) {
            return false;
        }

        return $this->stock_quantity > 0
            && $this->stock_quantity <= $this->low_stock_threshold;
    }

    /**
     * Determine whether the product is discounted.
     */
    public function isOnSale(): bool
    {
        return $this->compare_price !== null
            && (float) $this->compare_price > (float) $this->price;
    }

    /**
     * Get the discount percentage against the compare price.
     */
    public function discountPercentage(): int
    {
        if (! $this->isOnSale()) {
            return 0;
        }

        $compare = (float) $this->compare_price;

        if ($compare <= 0.0) {
            return 0;
        }

        return (int) round((($compare - (float) $this->price) / $compare) * 100);
    }

    /**
     * Get the average approved rating for the product.
     */
    public function averageRating(): float
    {
        if (isset($this->reviews_avg_rating)) {
            return round((float) $this->reviews_avg_rating, 1);
        }

        return round((float) $this->approvedReviews()->avg('rating'), 1);
    }

    /**
     * Get the URL of the primary image, falling back to a placeholder.
     */
    protected function imageUrl(): AttributeCast
    {
        return AttributeCast::get(function (): string {
            $image = $this->relationLoaded('images')
                ? $this->images->firstWhere('is_primary', true) ?? $this->images->first()
                : $this->primaryImage ?? $this->images()->first();

            return $image?->url() ?? asset('images/product-placeholder.svg');
        });
    }

    /**
     * Generate a unique slug from the given name.
     */
    public static function generateSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $suffix = 2;

        while (self::withTrashed()
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
