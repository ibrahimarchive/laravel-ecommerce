<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProductResource;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    /**
     * Render the storefront landing page.
     */
    public function __invoke(): Response
    {
        $featured = Product::query()
            ->purchasable()
            ->featured()
            ->withReviewStats()
            ->with(['images', 'variants.attributeValues', 'category', 'brand'])
            ->latest('published_at')
            ->take(8)
            ->get();

        $newArrivals = Product::query()
            ->purchasable()
            ->withReviewStats()
            ->with(['images', 'variants', 'category', 'brand'])
            ->latest('published_at')
            ->take(8)
            ->get();

        $onSale = Product::query()
            ->purchasable()
            ->onSale()
            ->withReviewStats()
            ->with(['images', 'variants', 'category', 'brand'])
            ->take(4)
            ->get();

        return Inertia::render('Home', [
            'featuredProducts' => ProductResource::collection($featured),
            'newArrivals' => ProductResource::collection($newArrivals),
            'onSaleProducts' => ProductResource::collection($onSale),
            'categories' => Category::query()
                ->where('is_active', true)
                ->whereNull('parent_id')
                ->withCount(['products' => fn (Builder $query) => $query->where('is_active', true)])
                ->orderBy('sort_order')
                ->take(6)
                ->get()
                ->map(fn (Category $category): array => [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'image' => $category->image,
                    'products_count' => $category->products_count,
                    'url' => route('category.show', $category->slug),
                ]),
            'brands' => Brand::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->take(10)
                ->get()
                ->map(fn (Brand $brand): array => [
                    'id' => $brand->id,
                    'name' => $brand->name,
                    'slug' => $brand->slug,
                    'logo' => $brand->logo,
                    'url' => route('brand.show', $brand->slug),
                ]),
        ]);
    }
}
