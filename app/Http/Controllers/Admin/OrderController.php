<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function __construct(private readonly OrderService $orders) {}

    /**
     * Display a paginated list of orders.
     */
    public function index(Request $request): Response
    {
        $filters = [
            'q' => $request->string('q')->trim()->value() ?: null,
            'status' => $request->string('status')->value() ?: null,
            'payment_status' => $request->string('payment_status')->value() ?: null,
        ];

        $orders = Order::query()
            ->with(['user:id,name'])
            ->when($filters['q'], function ($query, $term): void {
                $query->where(function ($query) use ($term): void {
                    $query->where('number', 'like', "%{$term}%")
                        ->orWhere('customer_name', 'like', "%{$term}%")
                        ->orWhere('customer_email', 'like', "%{$term}%");
                });
            })
            ->when($filters['status'], fn ($query, $status) => $query->where('status', $status))
            ->when($filters['payment_status'], fn ($query, $status) => $query->where('payment_status', $status))
            ->latest('placed_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Orders/Index', [
            'orders' => OrderResource::collection($orders),
            'filters' => $filters,
            'statuses' => OrderStatus::options(),
            'paymentStatuses' => PaymentStatus::options(),
        ]);
    }

    /**
     * Display the given order.
     */
    public function show(Order $order): Response
    {
        $order->load(['items', 'statusHistories.user:id,name', 'user:id,name,email']);

        return Inertia::render('Admin/Orders/Show', [
            'order' => new OrderResource($order),
            'statuses' => OrderStatus::options(),
            'allowedTransitions' => collect($order->status->allowedTransitions())
                ->map(fn (OrderStatus $status): array => [
                    'value' => $status->value,
                    'label' => $status->label(),
                ])
                ->all(),
        ]);
    }

    /**
     * Update the status of the given order.
     */
    public function updateStatus(Request $request, Order $order): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::enum(OrderStatus::class)],
            'note' => ['nullable', 'string', 'max:1000'],
            'tracking_number' => ['nullable', 'string', 'max:255'],
            'carrier' => ['nullable', 'string', 'max:255'],
        ]);

        $status = OrderStatus::from($data['status']);

        if (! $order->status->canTransitionTo($status) && $order->status !== $status) {
            return back()->with('error', "Cannot change status from {$order->status->label()} to {$status->label()}.");
        }

        if (array_key_exists('tracking_number', $data) || array_key_exists('carrier', $data)) {
            $order->forceFill([
                'tracking_number' => $data['tracking_number'] ?? $order->tracking_number,
                'carrier' => $data['carrier'] ?? $order->carrier,
            ])->save();
        }

        if ($order->status !== $status) {
            $this->orders->transition($order, $status, $data['note'] ?? null, $request->user()->id);
        }

        return back()->with('success', "Order {$order->number} marked as {$status->label()}.");
    }

    /**
     * Update the payment status of the given order.
     */
    public function updatePayment(Request $request, Order $order): RedirectResponse
    {
        $data = $request->validate([
            'payment_status' => ['required', Rule::enum(PaymentStatus::class)],
            'payment_reference' => ['nullable', 'string', 'max:255'],
        ]);

        $status = PaymentStatus::from($data['payment_status']);

        $order->forceFill([
            'payment_status' => $status,
            'payment_reference' => $data['payment_reference'] ?? $order->payment_reference,
            'amount_paid' => $status === PaymentStatus::Paid ? $order->grand_total : $order->amount_paid,
            'paid_at' => $status === PaymentStatus::Paid ? ($order->paid_at ?? now()) : $order->paid_at,
        ])->save();

        return back()->with('success', "Payment for order {$order->number} updated.");
    }
}
