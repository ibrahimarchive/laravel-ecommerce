<?php

namespace App\Http\Controllers;

use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Services\CartService;
use App\Support\CartTotals;
use App\Support\Store;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    public function __construct(private readonly CartService $carts) {}

    /**
     * Render the shopping cart.
     */
    public function index(Request $request): Response
    {
        $cart = $this->carts->current($request->user(), $request->session()->getId());
        $cart->load(['items.product.images', 'items.variant', 'coupon']);

        $totals = $this->carts->totals($cart);

        return Inertia::render('Cart/Index', [
            'items' => $cart->items->map(fn (CartItem $item): array => [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'name' => $item->product?->name,
                'variant' => $item->variant?->label(),
                'slug' => $item->product?->slug,
                'image' => $item->product?->image_url,
                'quantity' => $item->quantity,
                'unit_price' => (float) $item->unit_price,
                'unit_price_formatted' => Store::money($item->unit_price),
                'subtotal' => $item->subtotal(),
                'subtotal_formatted' => Store::money($item->subtotal()),
                'available_stock' => $item->availableStock(),
                'exceeds_stock' => $item->exceedsStock(),
                'price_changed' => $item->priceHasChanged(),
                'url' => $item->product ? route('shop.show', $item->product->slug) : null,
            ])->values(),
            'totals' => $totals->toArray(),
            'totalsFormatted' => $this->formattedTotals($totals),
            'coupon' => $cart->coupon ? [
                'code' => $cart->coupon->code,
                'label' => $cart->coupon->valueLabel(),
            ] : null,
            'shippingMethods' => $this->carts->shippingMethods(),
            'shippingMethod' => $cart->shipping_method,
        ]);
    }

    /**
     * Add a product (or variant) to the cart.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'product_variant_id' => ['nullable', 'integer', 'exists:product_variants,id'],
            'quantity' => ['required', 'integer', 'min:1', 'max:99'],
        ]);

        $product = Product::query()->purchasable()->findOrFail($validated['product_id']);

        $variant = null;

        if (! empty($validated['product_variant_id'])) {
            $variant = ProductVariant::query()
                ->where('product_id', $product->id)
                ->where('is_active', true)
                ->findOrFail($validated['product_variant_id']);
        }

        if ($variant === null && $product->hasVariants()) {
            throw ValidationException::withMessages([
                'product_variant_id' => 'Please choose an option before adding this item to your cart.',
            ]);
        }

        if ($product->manage_stock) {
            $available = $variant?->stock_quantity ?? $product->stock_quantity;

            if ($available < $validated['quantity']) {
                throw ValidationException::withMessages([
                    'quantity' => $available > 0
                        ? "Only {$available} left in stock."
                        : 'This item is currently out of stock.',
                ]);
            }
        }

        $cart = $this->carts->current($request->user(), $request->session()->getId());

        $this->carts->add($cart, $product, $variant, $validated['quantity']);

        return back()->with('success', $product->name.' was added to your cart.');
    }

    /**
     * Update the quantity of a cart item.
     */
    public function update(Request $request, CartItem $item): RedirectResponse
    {
        $this->authorizeItem($request, $item);

        $validated = $request->validate([
            'quantity' => ['required', 'integer', 'min:0', 'max:99'],
        ]);

        $this->carts->updateItem($item, $validated['quantity']);

        return back()->with('success', 'Your cart has been updated.');
    }

    /**
     * Remove an item from the cart.
     */
    public function destroy(Request $request, CartItem $item): RedirectResponse
    {
        $this->authorizeItem($request, $item);

        $this->carts->removeItem($item);

        return back()->with('success', 'The item was removed from your cart.');
    }

    /**
     * Apply a coupon code to the cart.
     */
    public function applyCoupon(Request $request): RedirectResponse
    {
        $request->validate([
            'coupon' => ['required', 'string', 'max:50'],
        ]);

        $cart = $this->carts->current($request->user(), $request->session()->getId());

        $this->carts->applyCoupon($cart, $request->string('coupon')->value());

        return back()->with('success', 'Your coupon has been applied.');
    }

    /**
     * Remove the coupon from the cart.
     */
    public function removeCoupon(Request $request): RedirectResponse
    {
        $cart = $this->carts->current($request->user(), $request->session()->getId());

        $this->carts->removeCoupon($cart);

        return back()->with('success', 'Your coupon has been removed.');
    }

    /**
     * Update the selected shipping method.
     */
    public function shipping(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'shipping_method' => ['required', 'string'],
        ]);

        $cart = $this->carts->current($request->user(), $request->session()->getId());

        $this->carts->setShippingMethod($cart, $validated['shipping_method']);

        return back();
    }

    /**
     * Empty the cart.
     */
    public function clear(Request $request): RedirectResponse
    {
        $cart = $this->carts->current($request->user(), $request->session()->getId());

        $this->carts->clear($cart);

        return redirect()->route('cart.index')->with('success', 'Your cart has been cleared.');
    }

    private function authorizeItem(Request $request, CartItem $item): void
    {
        $cart = $this->carts->find($request->user(), $request->session()->getId());

        abort_unless($cart !== null && $item->cart_id === $cart->id, 404);
    }

    /**
     * @return array<string, string>
     */
    private function formattedTotals(CartTotals $totals): array
    {
        return [
            'subtotal' => Store::money($totals->subtotal),
            'discount_total' => Store::money($totals->discountTotal),
            'tax_total' => Store::money($totals->taxTotal),
            'shipping_total' => Store::money($totals->shippingTotal),
            'grand_total' => Store::money($totals->grandTotal),
        ];
    }
}
