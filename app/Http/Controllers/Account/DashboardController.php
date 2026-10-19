<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Render the customer account overview.
     */
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        $recentOrders = $user->orders()
            ->with('items')
            ->latest('placed_at')
            ->take(5)
            ->get();

        return Inertia::render('Account/Dashboard', [
            'stats' => [
                'orders_count' => $user->orders()->count(),
                'open_orders' => $user->openOrdersCount(),
                'wishlist_count' => $user->wishlistItems()->count(),
                'addresses_count' => $user->addresses()->count(),
            ],
            'recentOrders' => OrderResource::collection($recentOrders),
        ]);
    }
}
