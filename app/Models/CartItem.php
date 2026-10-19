<?php

namespace App\Models;

use Database\Factories\CartItemFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['cart_id', 'product_id', 'product_variant_id', 'quantity', 'unit_price'])]
class CartItem extends Model
{
    /** @use HasFactory<CartItemFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'unit_price' => 'decimal:2',
        ];
    }

    /**
     * Get the cart the item belongs to.
     *
     * @return BelongsTo<Cart, $this>
     */
    public function cart(): BelongsTo
    {
        return $this->belongsTo(Cart::class);
    }

    /**
     * Get the product referenced by the item.
     *
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the variant referenced by the item.
     *
     * @return BelongsTo<ProductVariant, $this>
     */
    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }

    /**
     * Get the line total for the item.
     */
    public function subtotal(): float
    {
        return round((float) $this->unit_price * $this->quantity, 2);
    }

    /**
     * Get the currently sellable unit price, preferring the variant price.
     */
    public function currentUnitPrice(): float
    {
        if ($this->variant !== null) {
            return $this->variant->effectivePrice();
        }

        return (float) $this->product->price;
    }

    /**
     * Get the number of units available for the item's product or variant.
     */
    public function availableStock(): int
    {
        if ($this->variant !== null) {
            return (int) $this->variant->stock_quantity;
        }

        if (! $this->product->manage_stock) {
            return PHP_INT_MAX;
        }

        return $this->product->hasVariants()
            ? $this->product->totalStock()
            : (int) $this->product->stock_quantity;
    }

    /**
     * Determine whether the requested quantity exceeds available stock.
     */
    public function exceedsStock(): bool
    {
        return $this->availableStock() < $this->quantity;
    }

    /**
     * Determine whether the stored unit price differs from the current price.
     */
    public function priceHasChanged(): bool
    {
        return abs($this->currentUnitPrice() - (float) $this->unit_price) > 0.001;
    }

    /**
     * Build a display label describing the product and chosen options.
     */
    public function displayName(): string
    {
        $name = $this->product->name;

        if ($this->variant !== null) {
            $label = $this->variant->label();

            if ($label !== '' && $label !== $this->product->sku) {
                $name .= " ({$label})";
            }
        }

        return $name;
    }
}
