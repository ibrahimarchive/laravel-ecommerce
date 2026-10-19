<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\WishlistItem;
use App\Support\Store;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WishlistController extends Controller
{
    /**
     * List the customer's wishlist.
     */
    public function index(Request $request): Response
    {
        $items = $request->user()
            ->wishlistItems()
            ->with(['product.images', 'product.variants'])
            ->latest('id')
            ->get();

        return Inertia::render('Account/Wishlist/Index', [
            'items' => $items
                ->filter(fn (WishlistItem $item): bool => $item->product !== null)
                ->map(fn (WishlistItem $item): array => [
                    'id' => $item->id,
                    'product_id' => $item->product->id,
                    'name' => $item->product->name,
                    'slug' => $item->product->slug,
                    'image' => $item->product->image_url,
                    'url' => route('shop.show', $item->product->slug),
                    'price' => (float) $item->product->price,
                    'price_formatted' => Store::money($item->product->price),
                    'in_stock' => $item->product->isInStock(),
                ])->values(),
        ]);
    }

    /**
     * Add a product to the wishlist.
     */
    public function store(Request $request, Product $product): RedirectResponse
    {
        $request->user()->wishlistItems()->firstOrCreate([
            'product_id' => $product->id,
        ]);

        return back()->with('success', $product->name.' was added to your wishlist.');
    }

    /**
     * Remove a product from the wishlist.
     */
    public function destroy(Request $request, Product $product): RedirectResponse
    {
        $request->user()->wishlistItems()
            ->where('product_id', $product->id)
            ->delete();

        return back()->with('success', $product->name.' was removed from your wishlist.');
    }

    /**
     * Toggle a product's presence in the wishlist.
     */
    public function toggle(Request $request, Product $product): RedirectResponse
    {
        $existing = $request->user()->wishlistItems()
            ->where('product_id', $product->id)
            ->first();

        if ($existing) {
            $existing->delete();

            return back()->with('success', $product->name.' was removed from your wishlist.');
        }

        $request->user()->wishlistItems()->create([
            'product_id' => $product->id,
        ]);

        return back()->with('success', $product->name.' was added to your wishlist.');
    }
}
