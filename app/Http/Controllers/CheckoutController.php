<?php

namespace App\Http\Controllers;

use App\Http\Resources\OrderResource;
use App\Models\Address;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\User;
use App\Services\CartService;
use App\Services\OrderService;
use App\Services\PaymentService;
use App\Support\CartTotals;
use App\Support\Store;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    public function __construct(
        private readonly CartService $carts,
        private readonly OrderService $orders,
        private readonly PaymentService $payments,
    ) {}

    /**
     * Render the checkout page.
     */
    public function index(Request $request): Response|RedirectResponse
    {
        $cart = $this->currentCart($request);

        if ($cart->items->isEmpty()) {
            return redirect()->route('cart.index')->with('error', 'Your cart is empty.');
        }

        $totals = $this->carts->totals($cart);
        $user = $request->user();

        return Inertia::render('Checkout/Index', [
            'items' => $cart->items->map(fn (CartItem $item): array => [
                'id' => $item->id,
                'name' => $item->product?->name,
                'variant' => $item->variant?->label(),
                'quantity' => $item->quantity,
                'unit_price' => (float) $item->unit_price,
                'subtotal' => $item->subtotal(),
                'subtotal_formatted' => Store::money($item->subtotal()),
                'image' => $item->product?->image_url,
            ])->values(),
            'totals' => $totals->toArray(),
            'totalsFormatted' => $this->formattedTotals($totals),
            'addresses' => $user
                ? $user->addresses()
                    ->orderByDesc('is_default')
                    ->get()
                    ->map(fn (Address $address): array => [
                        'id' => $address->id,
                        'label' => $address->label,
                        'one_liner' => $address->oneLiner(),
                        'is_default' => $address->is_default,
                        'snapshot' => $address->toSnapshot(),
                    ])->values()
                : [],
            'shippingMethods' => $this->carts->shippingMethods(),
            'shippingMethod' => $cart->shipping_method,
            'paymentMethods' => $this->payments->availableMethods(),
            'defaults' => [
                'customer_name' => $user?->name,
                'customer_email' => $user?->email,
                'customer_phone' => $user?->phone,
            ],
            'allowGuestCheckout' => Store::allowGuestCheckout(),
        ]);
    }

    /**
     * Validate the checkout form and place the order.
     */
    public function store(Request $request): RedirectResponse
    {
        $cart = $this->currentCart($request);

        if ($cart->items->isEmpty()) {
            return redirect()->route('cart.index')->with('error', 'Your cart is empty.');
        }

        $user = $request->user();
        $savedAddress = null;

        if ($user && $request->filled('address_id')) {
            $savedAddress = $user->addresses()->findOrFail($request->integer('address_id'));
        }

        $rules = [
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_email' => ['required', 'string', 'email', 'max:255'],
            'customer_phone' => ['nullable', 'string', 'max:30'],
            'shipping_method' => ['required', 'string'],
            'payment_method' => ['required', 'string'],
            'customer_note' => ['nullable', 'string', 'max:1000'],
        ];

        if ($savedAddress === null) {
            $rules += [
                'first_name' => ['required', 'string', 'max:255'],
                'last_name' => ['required', 'string', 'max:255'],
                'address_line_1' => ['required', 'string', 'max:255'],
                'address_line_2' => ['nullable', 'string', 'max:255'],
                'city' => ['required', 'string', 'max:255'],
                'state' => ['nullable', 'string', 'max:255'],
                'postal_code' => ['required', 'string', 'max:20'],
                'country' => ['required', 'string', 'size:2'],
            ];
        }

        $validated = $request->validate($rules);

        $paymentMethods = array_column($this->payments->availableMethods(), 'value');

        if (! in_array($validated['payment_method'], $paymentMethods, true)) {
            return back()->withInput()->withErrors([
                'payment_method' => 'The selected payment method is not available.',
            ]);
        }

        $shippingAddress = $savedAddress ?? $this->resolveAddress($request, $validated, $user);
        $snapshot = $shippingAddress->toSnapshot();

        $order = $this->orders->place($cart, [
            'customer_name' => $validated['customer_name'],
            'customer_email' => $validated['customer_email'],
            'customer_phone' => $validated['customer_phone'] ?? null,
            'shipping_address' => $snapshot,
            'billing_address' => $snapshot,
            'shipping_address_id' => $shippingAddress->exists ? $shippingAddress->id : null,
            'shipping_method' => $validated['shipping_method'],
            'payment_method' => $validated['payment_method'],
            'customer_note' => $validated['customer_note'] ?? null,
            'currency' => Store::currency()['code'],
        ], $user);

        if ($redirect = $this->payments->begin($order)) {
            return redirect()->away($redirect);
        }

        return redirect()->route('checkout.success', $order->number)
            ->with('success', 'Thank you! Your order has been placed.');
    }

    /**
     * Render the order confirmation page.
     */
    public function success(Request $request, Order $order): Response
    {
        $this->authorizeOrder($request, $order);

        $sessionId = $request->string('session_id')->value();

        if ($sessionId && $order->payment_status->value === 'pending') {
            $this->payments->confirmStripeSession($order, $sessionId);
        }

        $order->load(['items', 'statusHistories']);

        return Inertia::render('Checkout/Success', [
            'order' => new OrderResource($order),
        ]);
    }

    /**
     * Render the page shown when a hosted payment is cancelled.
     */
    public function cancel(Request $request, Order $order): Response
    {
        $this->authorizeOrder($request, $order);

        return Inertia::render('Checkout/Cancel', [
            'order' => new OrderResource($order),
        ]);
    }

    private function currentCart(Request $request): Cart
    {
        $cart = $this->carts->current($request->user(), $request->session()->getId());

        return $cart->load(['items.product.images', 'items.variant', 'coupon']);
    }

    /**
     * Persist (for authenticated users) or build the shipping address.
     *
     * @param  array<string, mixed>  $validated
     */
    private function resolveAddress(Request $request, array $validated, ?User $user): Address
    {
        $attributes = [
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'address_line_1' => $validated['address_line_1'],
            'address_line_2' => $validated['address_line_2'] ?? null,
            'city' => $validated['city'],
            'state' => $validated['state'] ?? null,
            'postal_code' => $validated['postal_code'],
            'country' => strtoupper($validated['country']),
            'phone' => $validated['customer_phone'] ?? null,
            'label' => 'Shipping',
        ];

        if ($user === null) {
            return new Address($attributes);
        }

        $attributes['is_default'] = $user->addresses()->count() === 0;

        return $user->addresses()->create($attributes);
    }

    private function authorizeOrder(Request $request, Order $order): void
    {
        $user = $request->user();

        abort_unless(
            $order->user_id === null
                || ($user !== null && ($order->user_id === $user->id || $user->isAdmin())),
            404
        );
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
