<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\Review;
use App\Models\WishlistItem;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    /**
     * Render a single product with its variants, reviews and related items.
     */
    public function show(Request $request, Product $product): Response
    {
        abort_unless($product->is_active, 404);

        $product->load([
            'images',
            'variants.attributeValues.attribute',
            'attributeValues.attribute',
            'category',
            'brand',
        ]);

        $product->loadCount(['approvedReviews as reviews_count']);
        $product->loadAvg(['approvedReviews as reviews_avg_rating'], 'rating');

        $reviews = $product->approvedReviews()
            ->with('user:id,name,avatar')
            ->latest()
            ->take(10)
            ->get()
            ->map(fn (Review $review): array => [
                'id' => $review->id,
                'author_name' => $review->user?->name ?? $review->author_name,
                'avatar' => $review->user?->avatar,
                'rating' => $review->rating,
                'title' => $review->title,
                'body' => $review->body,
                'created_at' => $review->created_at?->toIso8601String(),
            ]);

        $related = Product::query()
            ->purchasable()
            ->whereKeyNot($product->id)
            ->when($product->category_id, fn ($query) => $query->where('category_id', $product->category_id))
            ->withReviewStats()
            ->with(['images', 'variants', 'brand'])
            ->take(4)
            ->get();

        return Inertia::render('Shop/Show', [
            'product' => new ProductResource($product),
            'reviews' => $reviews,
            'ratingBreakdown' => $this->ratingBreakdown($product),
            'relatedProducts' => ProductResource::collection($related),
            'inWishlist' => $request->user()
                ? WishlistItem::query()
                    ->where('user_id', $request->user()->id)
                    ->where('product_id', $product->id)
                    ->exists()
                : false,
            'canReview' => $this->canReview($request, $product),
        ]);
    }

    /**
     * Count the approved reviews for each star rating.
     *
     * @return array<int, int>
     */
    private function ratingBreakdown(Product $product): array
    {
        $counts = $product->approvedReviews()
            ->selectRaw('rating, count(*) as total')
            ->groupBy('rating')
            ->pluck('total', 'rating');

        $breakdown = [];

        foreach ([5, 4, 3, 2, 1] as $star) {
            $breakdown[$star] = (int) ($counts[$star] ?? 0);
        }

        return $breakdown;
    }

    private function canReview(Request $request, Product $product): bool
    {
        $user = $request->user();

        if (! $user) {
            return false;
        }

        return ! $product->reviews()->where('user_id', $user->id)->exists();
    }
}
