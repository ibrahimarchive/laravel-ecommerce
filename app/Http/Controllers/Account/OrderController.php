<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    /**
     * List the authenticated customer's orders.
     */
    public function index(Request $request): Response
    {
        $orders = $request->user()
            ->orders()
            ->with('items')
            ->latest('placed_at')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Account/Orders/Index', [
            'orders' => OrderResource::collection($orders),
        ]);
    }

    /**
     * Show a single order belonging to the customer.
     */
    public function show(Request $request, Order $order): Response
    {
        abort_unless($order->user_id === $request->user()->id, 404);

        $order->load(['items', 'statusHistories']);

        return Inertia::render('Account/Orders/Show', [
            'order' => new OrderResource($order),
        ]);
    }
}
