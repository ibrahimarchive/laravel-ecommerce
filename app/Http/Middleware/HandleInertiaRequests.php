<?php

namespace App\Http\Middleware;

use App\Models\Page;
use App\Services\CartService;
use App\Support\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar' => $user->avatar,
                    'is_admin' => $user->isAdmin(),
                ] : null,
            ],
            'cart' => fn (): array => $this->cartSummary($request),
            'store' => [
                'name' => Store::name(),
                'tagline' => Store::tagline(),
                'email' => Store::email(),
                'phone' => Store::phone(),
                'address' => Store::address(),
                'currency' => Store::currency(),
                'social' => Store::socialLinks(),
                'free_shipping_threshold' => Store::freeShippingThreshold(),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'info' => fn () => $request->session()->get('info'),
            ],
            'footerPages' => fn (): Collection => Page::query()
                ->published()
                ->inFooter()
                ->ordered()
                ->get(['title', 'slug'])
                ->map(fn (Page $page): array => [
                    'title' => $page->title,
                    'slug' => $page->slug,
                    'url' => route('page.show', $page->slug),
                ]),
        ];
    }

    /**
     * A lightweight summary of the active cart for the navigation badge.
     *
     * @return array{items_count: int, subtotal: float, subtotal_formatted: string}
     */
    private function cartSummary(Request $request): array
    {
        $carts = app(CartService::class);

        $cart = $carts->find($request->user(), $request->session()->getId());

        if (! $cart) {
            return ['items_count' => 0, 'subtotal' => 0.0, 'subtotal_formatted' => Store::money(0)];
        }

        $totals = $carts->totals($cart);

        return [
            'items_count' => $totals->itemsCount,
            'subtotal' => $totals->subtotal,
            'subtotal_formatted' => Store::money($totals->subtotal),
        ];
    }
}
