<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReviewController extends Controller
{
    /**
     * Display a listing of reviews.
     */
    public function index(Request $request): Response
    {
        $filters = [
            'q' => $request->string('q')->trim()->value() ?: null,
            'status' => $request->string('status')->value() ?: 'pending',
            'rating' => $request->integer('rating') ?: null,
        ];

        $reviews = Review::query()
            ->with(['product:id,name,slug', 'user:id,name'])
            ->when($filters['q'], function ($query, $term): void {
                $query->where(function ($query) use ($term): void {
                    $query->where('author_name', 'like', "%{$term}%")
                        ->orWhere('title', 'like', "%{$term}%")
                        ->orWhereHas('product', fn ($query) => $query->where('name', 'like', "%{$term}%"));
                });
            })
            ->when($filters['status'] === 'pending', fn ($query) => $query->where('is_approved', false))
            ->when($filters['status'] === 'approved', fn ($query) => $query->where('is_approved', true))
            ->when($filters['rating'], fn ($query, $rating) => $query->where('rating', $rating))
            ->latest('id')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Reviews/Index', [
            'reviews' => $reviews->through(fn (Review $review): array => [
                'id' => $review->id,
                'product' => $review->product ? [
                    'id' => $review->product->id,
                    'name' => $review->product->name,
                    'slug' => $review->product->slug,
                ] : null,
                'user' => $review->user?->name,
                'author_name' => $review->author_name,
                'author_email' => $review->author_email,
                'rating' => $review->rating,
                'title' => $review->title,
                'body' => $review->body,
                'is_approved' => (bool) $review->is_approved,
                'created_at' => $review->created_at->toIso8601String(),
            ]),
            'filters' => $filters,
        ]);
    }

    /**
     * Approve the given review.
     */
    public function approve(Review $review): RedirectResponse
    {
        $review->approve();

        return back()->with('success', 'Review approved.');
    }

    /**
     * Reject (unapprove) the given review.
     */
    public function reject(Review $review): RedirectResponse
    {
        $review->reject();

        return back()->with('success', 'Review rejected.');
    }

    /**
     * Delete the given review.
     */
    public function destroy(Review $review): RedirectResponse
    {
        $review->delete();

        return back()->with('success', 'Review deleted.');
    }
}
