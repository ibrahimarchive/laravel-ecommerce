<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Support\Store;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ReviewController extends Controller
{
    /**
     * Store a customer review for a product.
     *
     * @throws ValidationException
     */
    public function store(Request $request, Product $product): RedirectResponse
    {
        abort_unless($product->is_active, 404);

        $user = $request->user();

        if ($user && $product->reviews()->where('user_id', $user->id)->exists()) {
            throw ValidationException::withMessages([
                'rating' => 'You have already reviewed this product.',
            ]);
        }

        $rules = [
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'title' => ['nullable', 'string', 'max:255'],
            'body' => ['nullable', 'string', 'max:2000'],
        ];

        if ($user === null) {
            $rules['author_name'] = ['required', 'string', 'max:255'];
            $rules['author_email'] = ['required', 'string', 'email', 'max:255'];
        }

        $validated = $request->validate($rules);

        $requiresApproval = Store::reviewsRequireApproval();

        $product->reviews()->create([
            'user_id' => $user?->id,
            'author_name' => $user?->name ?? $validated['author_name'],
            'author_email' => $user?->email ?? $validated['author_email'],
            'rating' => $validated['rating'],
            'title' => $validated['title'] ?? null,
            'body' => $validated['body'] ?? null,
            'is_approved' => ! $requiresApproval,
            'approved_at' => $requiresApproval ? null : now(),
        ]);

        return back()->with(
            'success',
            $requiresApproval
                ? 'Thanks! Your review has been submitted and is awaiting approval.'
                : 'Thanks for your review!'
        );
    }
}
