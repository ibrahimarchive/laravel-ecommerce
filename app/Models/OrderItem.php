<?php

namespace App\Models;

use Database\Factories\OrderItemFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'order_id', 'product_id', 'product_variant_id', 'product_name', 'variant_name',
    'sku', 'options', 'unit_price', 'quantity', 'subtotal',
    'discount_total', 'tax_total', 'total',
])]
class OrderItem extends Model
{
    /** @use HasFactory<OrderItemFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'options' => 'array',
            'unit_price' => 'decimal:2',
            'quantity' => 'integer',
            'subtotal' => 'decimal:2',
            'discount_total' => 'decimal:2',
            'tax_total' => 'decimal:2',
            'total' => 'decimal:2',
        ];
    }

    /**
     * Get the order the item belongs to.
     *
     * @return BelongsTo<Order, $this>
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the product referenced by the item, if it still exists.
     *
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the variant referenced by the item, if it still exists.
     *
     * @return BelongsTo<ProductVariant, $this>
     */
    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }

    /**
     * Build the full display name including the chosen variant.
     */
    public function displayName(): string
    {
        return $this->variant_name === null
            ? $this->product_name
            : "{$this->product_name} ({$this->variant_name})";
    }

    /**
     * Get the product URL when the product is still available.
     */
    public function productUrl(): ?string
    {
        if ($this->product === null || $this->product->trashed()) {
            return null;
        }

        return route('shop.show', $this->product->slug);
    }
}
