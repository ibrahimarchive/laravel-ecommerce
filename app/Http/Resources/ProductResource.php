<?php

namespace App\Http\Resources;

use App\Models\Product;
use App\Support\Store;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Product
 */
class ProductResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $comparePrice = $this->compare_price !== null ? (float) $this->compare_price : null;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'sku' => $this->sku,
            'short_description' => $this->short_description,
            'description' => $this->description,
            'price' => (float) $this->price,
            'compare_price' => $comparePrice,
            'price_formatted' => Store::money($this->price),
            'compare_price_formatted' => $comparePrice !== null ? Store::money($comparePrice) : null,
            'is_on_sale' => $this->isOnSale(),
            'discount_percentage' => $this->discountPercentage(),
            'has_variants' => $this->hasVariants(),
            'stock_quantity' => $this->totalStock(),
            'in_stock' => $this->isInStock(),
            'low_stock' => $this->isLowStock(),
            'is_featured' => $this->is_featured,
            'rating' => round((float) ($this->reviews_avg_rating ?? 0), 1),
            'reviews_count' => (int) ($this->reviews_count ?? 0),
            'image' => $this->image_url,
            'url' => route('shop.show', $this->slug),
            'category' => $this->whenLoaded('category', fn (): ?array => $this->category ? [
                'id' => $this->category->id,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ] : null),
            'brand' => $this->whenLoaded('brand', fn (): ?array => $this->brand ? [
                'id' => $this->brand->id,
                'name' => $this->brand->name,
                'slug' => $this->brand->slug,
            ] : null),
            'images' => $this->whenLoaded('images', fn () => $this->images->map(fn ($image): array => [
                'id' => $image->id,
                'url' => $image->url(),
                'alt' => $image->alt,
                'is_primary' => $image->is_primary,
            ])->values()),
            'variants' => $this->whenLoaded('variants', fn () => $this->variants->map(fn ($variant): array => [
                'id' => $variant->id,
                'name' => $variant->name,
                'label' => $variant->label(),
                'sku' => $variant->sku,
                'price' => (float) $variant->effectivePrice(),
                'price_formatted' => Store::money($variant->effectivePrice()),
                'compare_price' => $variant->effectiveComparePrice(),
                'in_stock' => $variant->stock_quantity > 0,
                'stock_quantity' => $variant->stock_quantity,
                'attribute_value_ids' => $variant->attributeValues->pluck('id')->values(),
            ])->values()),
            'attribute_values' => $this->whenLoaded('attributeValues', fn () => $this->attributeValues->map(fn ($value): array => [
                'id' => $value->id,
                'value' => $value->value,
                'slug' => $value->slug,
                'color_hex' => $value->color_hex,
                'attribute_id' => $value->attribute_id,
                'attribute_name' => $value->attribute?->name,
                'attribute_slug' => $value->attribute?->slug,
            ])->values()),
        ];
    }
}
