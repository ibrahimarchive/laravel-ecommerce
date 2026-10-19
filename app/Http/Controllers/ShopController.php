<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProductResource;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Support\Store;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShopController extends Controller
{
    /**
     * Render the shop listing with the active filters applied.
     */
    public function index(Request $request): Response
    {
        return $this->listing($request);
    }

    /**
     * Render the shop listing scoped to a single category.
     */
    public function category(Request $request, Category $category): Response
    {
        return $this->listing($request, category: $category);
    }

    /**
     * Render the shop listing scoped to a single brand.
     */
    public function brand(Request $request, Brand $brand): Response
    {
        return $this->listing($request, brand: $brand);
    }

    private function listing(Request $request, ?Category $category = null, ?Brand $brand = null): Response
    {
        $filters = [
            'q' => $request->string('q')->trim()->value() ?: null,
            'category' => $category->slug ?? ($request->string('category')->value() ?: null),
            'brand' => $brand->slug ?? ($request->string('brand')->value() ?: null),
            'min_price' => $request->filled('min_price') ? (float) $request->input('min_price') : null,
            'max_price' => $request->filled('max_price') ? (float) $request->input('max_price') : null,
            'rating' => $request->filled('rating') ? (int) $request->input('rating') : null,
            'on_sale' => $request->boolean('on_sale'),
            'in_stock' => $request->boolean('in_stock'),
            'sort' => $request->string('sort')->value() ?: 'default',
        ];

        $query = Product::query()
            ->purchasable()
            ->withReviewStats()
            ->with(['images', 'variants', 'category', 'brand']);

        if ($filters['q']) {
            $query->search($filters['q']);
        }

        if ($category) {
            $query->whereIn('category_id', $this->categoryIds($category));
        } elseif ($filters['category']) {
            $query->whereHas('category', fn (Builder $inner) => $inner->where('slug', $filters['category']));
        }

        if ($filters['brand']) {
            $query->whereHas('brand', fn (Builder $inner) => $inner->where('slug', $filters['brand']));
        }

        if ($filters['min_price'] !== null || $filters['max_price'] !== null) {
            $query->priceBetween($filters['min_price'], $filters['max_price']);
        }

        if ($filters['on_sale']) {
            $query->onSale();
        }

        if ($filters['in_stock']) {
            $query->inStock();
        }

        if ($filters['rating']) {
            $query->whereRaw(
                '(select avg(rating) from reviews where reviews.product_id = products.id and reviews.is_approved = true) >= ?',
                [$filters['rating']]
            );
        }

        $products = $query
            ->sortBy($filters['sort'])
            ->paginate(Store::productsPerPage())
            ->withQueryString();

        return Inertia::render('Shop/Index', [
            'products' => ProductResource::collection($products),
            'filters' => $filters,
            'options' => $this->filterOptions(),
            'heading' => $category?->name ?? $brand?->name ?? 'All Products',
            'category' => $category?->only('id', 'name', 'slug'),
            'brand' => $brand?->only('id', 'name', 'slug'),
        ]);
    }

    /**
     * @return array<int, int>
     */
    private function categoryIds(Category $category): array
    {
        return [$category->id, ...$category->children()->pluck('id')->all()];
    }

    /**
     * @return array<string, mixed>
     */
    private function filterOptions(): array
    {
        return [
            'categories' => Category::query()
                ->where('is_active', true)
                ->whereNull('parent_id')
                ->with(['children' => fn ($query) => $query->where('is_active', true)->orderBy('sort_order')])
                ->orderBy('sort_order')
                ->get()
                ->map(fn (Category $parent): array => [
                    'id' => $parent->id,
                    'name' => $parent->name,
                    'slug' => $parent->slug,
                    'children' => $parent->children->map(fn (Category $child): array => [
                        'id' => $child->id,
                        'name' => $child->name,
                        'slug' => $child->slug,
                    ])->values(),
                ])->values(),
            'brands' => Brand::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'slug'])
                ->map(fn (Brand $brand): array => [
                    'id' => $brand->id,
                    'name' => $brand->name,
                    'slug' => $brand->slug,
                ])->values(),
            'price_range' => [
                'min' => (float) Product::query()->purchasable()->min('price'),
                'max' => (float) Product::query()->purchasable()->max('price'),
            ],
            'sorts' => [
                ['value' => 'default', 'label' => 'Newest'],
                ['value' => 'price_asc', 'label' => 'Price: Low to High'],
                ['value' => 'price_desc', 'label' => 'Price: High to Low'],
                ['value' => 'name_asc', 'label' => 'Name: A-Z'],
                ['value' => 'name_desc', 'label' => 'Name: Z-A'],
                ['value' => 'rating', 'label' => 'Top Rated'],
                ['value' => 'popular', 'label' => 'Most Reviewed'],
            ],
        ];
    }
}
