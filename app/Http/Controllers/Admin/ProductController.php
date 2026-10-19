<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Attribute;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    /**
     * Display a paginated list of products.
     */
    public function index(Request $request): Response
    {
        $filters = [
            'q' => $request->string('q')->trim()->value() ?: null,
            'category' => $request->integer('category') ?: null,
            'brand' => $request->integer('brand') ?: null,
            'status' => $request->string('status')->value() ?: null,
            'sort' => $request->string('sort')->value() ?: 'latest',
        ];

        $products = Product::query()
            ->with(['category:id,name', 'brand:id,name', 'images', 'variants'])
            ->withCount('variants')
            ->when($filters['q'], fn ($query, $term) => $query->search($term))
            ->when($filters['category'], fn ($query, $id) => $query->where('category_id', $id))
            ->when($filters['brand'], fn ($query, $id) => $query->where('brand_id', $id))
            ->when($filters['status'] === 'active', fn ($query) => $query->where('is_active', true))
            ->when($filters['status'] === 'inactive', fn ($query) => $query->where('is_active', false))
            ->when($filters['status'] === 'low_stock', fn ($query) => $query->where('manage_stock', true)->whereColumn('stock_quantity', '<=', 'low_stock_threshold'))
            ->when($filters['sort'] === 'name', fn ($query) => $query->orderBy('name'))
            ->when($filters['sort'] === 'price', fn ($query) => $query->orderByDesc('price'))
            ->when($filters['sort'] === 'stock', fn ($query) => $query->orderBy('stock_quantity'))
            ->when(! in_array($filters['sort'], ['name', 'price', 'stock'], true), fn ($query) => $query->latest('id'))
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Products/Index', [
            'products' => ProductResource::collection($products),
            'filters' => $filters,
            'categories' => $this->categoryOptions(),
            'brands' => $this->brandOptions(),
        ]);
    }

    /**
     * Show the form for creating a new product.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/Products/Create', [
            'categories' => $this->categoryOptions(),
            'brands' => $this->brandOptions(),
            'attributes' => $this->attributeOptions(),
        ]);
    }

    /**
     * Store a newly created product.
     */
    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);
        $attributeValueIds = $this->attributeValueIds($request);
        $images = $this->imagePayload($request);
        $variants = $this->variantPayload($request);

        $product = DB::transaction(function () use ($data, $attributeValueIds, $images, $variants): Product {
            $product = Product::create($this->productAttributes($data));
            $product->attributeValues()->sync($attributeValueIds);

            $this->syncImages($product, $images);
            $this->syncVariants($product, $variants);

            return $product;
        });

        return redirect()
            ->route('admin.products.edit', $product)
            ->with('success', "Product \"{$product->name}\" created successfully.");
    }

    /**
     * Show the form for editing the given product.
     */
    public function edit(Product $product): Response
    {
        $product->load(['images', 'variants.attributeValues', 'attributeValues']);

        return Inertia::render('Admin/Products/Edit', [
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'sku' => $product->sku,
                'category_id' => $product->category_id,
                'brand_id' => $product->brand_id,
                'short_description' => $product->short_description,
                'description' => $product->description,
                'price' => (float) $product->price,
                'compare_price' => $product->compare_price !== null ? (float) $product->compare_price : null,
                'cost_price' => $product->cost_price !== null ? (float) $product->cost_price : null,
                'stock_quantity' => $product->stock_quantity,
                'low_stock_threshold' => $product->low_stock_threshold,
                'manage_stock' => (bool) $product->manage_stock,
                'is_active' => (bool) $product->is_active,
                'is_featured' => (bool) $product->is_featured,
                'weight' => $product->weight !== null ? (float) $product->weight : null,
                'meta_title' => $product->meta_title,
                'meta_description' => $product->meta_description,
                'published_at' => $product->published_at?->toDateString(),
                'attribute_value_ids' => $product->attributeValues->pluck('id'),
                'images' => $product->images->map(fn (ProductImage $image): array => [
                    'id' => $image->id,
                    'path' => $image->path,
                    'alt' => $image->alt,
                    'is_primary' => (bool) $image->is_primary,
                ]),
                'variants' => $product->variants->map(fn (ProductVariant $variant): array => [
                    'id' => $variant->id,
                    'name' => $variant->name,
                    'sku' => $variant->sku,
                    'price' => $variant->price !== null ? (float) $variant->price : null,
                    'compare_price' => $variant->compare_price !== null ? (float) $variant->compare_price : null,
                    'stock_quantity' => $variant->stock_quantity,
                    'is_active' => (bool) $variant->is_active,
                    'attribute_value_ids' => $variant->attributeValues->pluck('id'),
                ]),
            ],
            'categories' => $this->categoryOptions(),
            'brands' => $this->brandOptions(),
            'attributes' => $this->attributeOptions(),
        ]);
    }

    /**
     * Update the given product.
     */
    public function update(Request $request, Product $product): RedirectResponse
    {
        $data = $this->validated($request, $product);
        $attributeValueIds = $this->attributeValueIds($request);
        $images = $this->imagePayload($request);
        $variants = $this->variantPayload($request);

        DB::transaction(function () use ($product, $data, $attributeValueIds, $images, $variants): void {
            $product->update($this->productAttributes($data, $product));
            $product->attributeValues()->sync($attributeValueIds);

            $this->syncImages($product, $images);
            $this->syncVariants($product, $variants);
        });

        return back()->with('success', "Product \"{$product->name}\" updated successfully.");
    }

    /**
     * Soft delete the given product.
     */
    public function destroy(Product $product): RedirectResponse
    {
        $product->delete();

        return redirect()
            ->route('admin.products.index')
            ->with('success', "Product \"{$product->name}\" deleted.");
    }

    /**
     * Restore a soft deleted product.
     */
    public function restore(Product $product): RedirectResponse
    {
        $product->restore();

        return back()->with('success', "Product \"{$product->name}\" restored.");
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request, ?Product $product = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('products', 'slug')->ignore($product?->id)],
            'sku' => ['nullable', 'string', 'max:255', Rule::unique('products', 'sku')->ignore($product?->id)],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'brand_id' => ['nullable', 'integer', 'exists:brands,id'],
            'short_description' => ['nullable', 'string', 'max:500'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'compare_price' => ['nullable', 'numeric', 'min:0'],
            'cost_price' => ['nullable', 'numeric', 'min:0'],
            'stock_quantity' => ['required', 'integer', 'min:0'],
            'low_stock_threshold' => ['required', 'integer', 'min:0'],
            'manage_stock' => ['boolean'],
            'is_active' => ['boolean'],
            'is_featured' => ['boolean'],
            'weight' => ['nullable', 'numeric', 'min:0'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'published_at' => ['nullable', 'date'],
            'attribute_value_ids' => ['array'],
            'attribute_value_ids.*' => ['integer', 'exists:attribute_values,id'],
            'images' => ['array'],
            'images.*.path' => ['required', 'string', 'max:2048'],
            'images.*.alt' => ['nullable', 'string', 'max:255'],
            'images.*.is_primary' => ['boolean'],
            'variants' => ['array'],
            'variants.*.name' => ['nullable', 'string', 'max:255'],
            'variants.*.sku' => ['nullable', 'string', 'max:255'],
            'variants.*.price' => ['nullable', 'numeric', 'min:0'],
            'variants.*.compare_price' => ['nullable', 'numeric', 'min:0'],
            'variants.*.stock_quantity' => ['nullable', 'integer', 'min:0'],
            'variants.*.is_active' => ['boolean'],
            'variants.*.attribute_value_ids' => ['array'],
            'variants.*.attribute_value_ids.*' => ['integer', 'exists:attribute_values,id'],
        ]);
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function productAttributes(array $data, ?Product $product = null): array
    {
        $slug = filled($data['slug'] ?? null)
            ? $data['slug']
            : Product::generateSlug($data['name'], $product?->id);

        return [
            'category_id' => $data['category_id'] ?? null,
            'brand_id' => $data['brand_id'] ?? null,
            'name' => $data['name'],
            'slug' => $slug,
            'sku' => $data['sku'] ?? null,
            'short_description' => $data['short_description'] ?? null,
            'description' => $data['description'] ?? null,
            'price' => $data['price'],
            'compare_price' => $data['compare_price'] ?? null,
            'cost_price' => $data['cost_price'] ?? null,
            'stock_quantity' => $data['stock_quantity'],
            'low_stock_threshold' => $data['low_stock_threshold'],
            'manage_stock' => (bool) ($data['manage_stock'] ?? false),
            'is_active' => (bool) ($data['is_active'] ?? false),
            'is_featured' => (bool) ($data['is_featured'] ?? false),
            'weight' => $data['weight'] ?? null,
            'meta_title' => $data['meta_title'] ?? null,
            'meta_description' => $data['meta_description'] ?? null,
            'published_at' => $data['published_at'] ?? null,
        ];
    }

    /**
     * @return array<int, int>
     */
    private function attributeValueIds(Request $request): array
    {
        return collect($request->input('attribute_value_ids', []))
            ->map(fn ($id): int => (int) $id)
            ->unique()
            ->values()
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function imagePayload(Request $request): array
    {
        return collect($request->input('images', []))
            ->map(fn (array $image): array => [
                'path' => $image['path'],
                'alt' => $image['alt'] ?? null,
                'is_primary' => (bool) ($image['is_primary'] ?? false),
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function variantPayload(Request $request): array
    {
        return collect($request->input('variants', []))
            ->map(fn (array $variant): array => [
                'name' => $variant['name'] ?? null,
                'sku' => $variant['sku'] ?? null,
                'price' => $variant['price'] ?? null,
                'compare_price' => $variant['compare_price'] ?? null,
                'stock_quantity' => (int) ($variant['stock_quantity'] ?? 0),
                'is_active' => (bool) ($variant['is_active'] ?? true),
                'attribute_value_ids' => collect($variant['attribute_value_ids'] ?? [])
                    ->map(fn ($id): int => (int) $id)
                    ->unique()
                    ->values()
                    ->all(),
            ])
            ->values()
            ->all();
    }

    /**
     * @param  array<int, array<string, mixed>>  $images
     */
    private function syncImages(Product $product, array $images): void
    {
        $product->images()->delete();

        $hasPrimary = collect($images)->contains(fn (array $image): bool => $image['is_primary'] === true);

        foreach ($images as $index => $image) {
            $product->images()->create([
                'path' => $image['path'],
                'alt' => $image['alt'],
                'sort_order' => $index,
                'is_primary' => $hasPrimary ? $image['is_primary'] : $index === 0,
            ]);
        }
    }

    /**
     * @param  array<int, array<string, mixed>>  $variants
     */
    private function syncVariants(Product $product, array $variants): void
    {
        $product->variants()->delete();

        foreach ($variants as $index => $variant) {
            $model = $product->variants()->create([
                'name' => $variant['name'],
                'sku' => filled($variant['sku'])
                    ? $variant['sku']
                    : ProductVariant::generateSku($product->sku ?: $product->slug, null),
                'price' => $variant['price'],
                'compare_price' => $variant['compare_price'],
                'stock_quantity' => $variant['stock_quantity'],
                'is_active' => $variant['is_active'],
                'sort_order' => $index,
            ]);

            $model->attributeValues()->sync($variant['attribute_value_ids']);
        }
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function categoryOptions(): array
    {
        return Category::query()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'name', 'parent_id'])
            ->map(fn (Category $category): array => [
                'id' => $category->id,
                'name' => $category->name,
                'parent_id' => $category->parent_id,
            ])
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function brandOptions(): array
    {
        return Brand::query()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Brand $brand): array => [
                'id' => $brand->id,
                'name' => $brand->name,
            ])
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function attributeOptions(): array
    {
        return Attribute::query()
            ->with(['values' => fn ($query) => $query->orderBy('sort_order')])
            ->orderBy('sort_order')
            ->get()
            ->map(fn (Attribute $attribute): array => [
                'id' => $attribute->id,
                'name' => $attribute->name,
                'slug' => $attribute->slug,
                'type' => $attribute->type,
                'is_variation' => (bool) $attribute->is_variation,
                'values' => $attribute->values->map(fn ($value): array => [
                    'id' => $value->id,
                    'value' => $value->value,
                    'slug' => $value->slug,
                    'color_hex' => $value->color_hex,
                ])->all(),
            ])
            ->all();
    }
}
