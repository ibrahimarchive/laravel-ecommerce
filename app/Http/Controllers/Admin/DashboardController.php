<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\ContactMessage;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use App\Support\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Render the administration dashboard.
     */
    public function __invoke(Request $request): Response
    {
        $paidOrders = Order::query()->where('payment_status', PaymentStatus::Paid);

        $revenueTotal = (float) (clone $paidOrders)->sum('grand_total');
        $revenueMonth = (float) (clone $paidOrders)
            ->where('placed_at', '>=', now()->startOfMonth())
            ->sum('grand_total');

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'revenue_total' => $revenueTotal,
                'revenue_total_formatted' => Store::money($revenueTotal),
                'revenue_month' => $revenueMonth,
                'revenue_month_formatted' => Store::money($revenueMonth),
                'orders_count' => Order::query()->count(),
                'orders_pending' => Order::query()->where('status', OrderStatus::Pending)->count(),
                'products_count' => Product::query()->count(),
                'low_stock_count' => Product::query()
                    ->managesStock()
                    ->where('stock_quantity', '>', 0)
                    ->whereColumn('stock_quantity', '<=', 'low_stock_threshold')
                    ->count(),
                'customers_count' => User::query()->count(),
                'reviews_pending' => Review::query()->where('is_approved', false)->count(),
                'messages_unread' => ContactMessage::query()->where('is_read', false)->count(),
            ],
            'recentOrders' => OrderResource::collection(
                Order::query()->with('items')->latest('placed_at')->take(8)->get()
            ),
            'lowStockProducts' => Product::query()
                ->managesStock()
                ->where('stock_quantity', '>', 0)
                ->whereColumn('stock_quantity', '<=', 'low_stock_threshold')
                ->orderBy('stock_quantity')
                ->take(6)
                ->get(['id', 'name', 'slug', 'stock_quantity', 'low_stock_threshold'])
                ->map(fn (Product $product): array => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'stock_quantity' => $product->stock_quantity,
                    'low_stock_threshold' => $product->low_stock_threshold,
                ]),
            'topProducts' => $this->topProducts(),
            'salesChart' => $this->salesChart(),
        ]);
    }

    /**
     * Best selling products by quantity ordered.
     *
     * @return Collection<int, array<string, mixed>>
     */
    private function topProducts(): Collection
    {
        return DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->whereNull('orders.deleted_at')
            ->selectRaw('order_items.product_name, sum(order_items.quantity) as quantity, sum(order_items.total) as revenue')
            ->groupBy('order_items.product_name')
            ->orderByDesc('quantity')
            ->limit(5)
            ->get()
            ->map(fn (object $row): array => [
                'name' => $row->product_name,
                'quantity' => (int) $row->quantity,
                'revenue' => (float) $row->revenue,
                'revenue_formatted' => Store::money($row->revenue),
            ]);
    }

    /**
     * Daily order totals for the last fourteen days.
     *
     * @return array<int, array{date: string, total: float}>
     */
    private function salesChart(): array
    {
        $totals = Order::query()
            ->where('placed_at', '>=', now()->subDays(13)->startOfDay())
            ->selectRaw('DATE(placed_at) as day, sum(grand_total) as total')
            ->groupBy('day')
            ->pluck('total', 'day');

        return collect(range(13, 0))
            ->map(function (int $daysAgo) use ($totals): array {
                $date = now()->subDays($daysAgo)->toDateString();

                return [
                    'date' => $date,
                    'total' => (float) ($totals[$date] ?? 0),
                ];
            })
            ->all();
    }
}
