<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    /**
     * Display a paginated list of customers.
     */
    public function index(Request $request): Response
    {
        $filters = [
            'q' => $request->string('q')->trim()->value() ?: null,
            'status' => $request->string('status')->value() ?: null,
        ];

        $customers = User::query()
            ->whereHas('roles', fn ($query) => $query->where('slug', 'customer'))
            ->withCount(['orders', 'reviews'])
            ->when($filters['q'], function ($query, $term): void {
                $query->where(function ($query) use ($term): void {
                    $query->where('name', 'like', "%{$term}%")
                        ->orWhere('email', 'like', "%{$term}%")
                        ->orWhere('phone', 'like', "%{$term}%");
                });
            })
            ->when($filters['status'] === 'active', fn ($query) => $query->where('is_active', true))
            ->when($filters['status'] === 'inactive', fn ($query) => $query->where('is_active', false))
            ->latest('id')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Customers/Index', [
            'customers' => $customers->through(fn (User $user): array => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'is_active' => (bool) $user->is_active,
                'orders_count' => $user->orders_count,
                'reviews_count' => $user->reviews_count,
                'last_login_at' => $user->last_login_at?->toIso8601String(),
                'created_at' => $user->created_at->toDateString(),
            ]),
            'filters' => $filters,
        ]);
    }

    /**
     * Display the given customer.
     */
    public function show(User $customer): Response
    {
        abort_unless($customer->hasRole('customer'), 404);

        $customer->load([
            'addresses',
            'orders' => fn ($query) => $query->latest('placed_at')->limit(20),
        ]);

        return Inertia::render('Admin/Customers/Show', [
            'customer' => [
                'id' => $customer->id,
                'name' => $customer->name,
                'email' => $customer->email,
                'phone' => $customer->phone,
                'avatar' => $customer->avatar,
                'is_active' => (bool) $customer->is_active,
                'last_login_at' => $customer->last_login_at?->toIso8601String(),
                'created_at' => $customer->created_at->toDateString(),
                'addresses' => $customer->addresses->map(fn ($address): array => [
                    'id' => $address->id,
                    'label' => $address->label,
                    'one_liner' => $address->oneLiner(),
                    'country' => $address->country,
                    'phone' => $address->phone,
                ]),
            ],
            'orders' => OrderResource::collection($customer->orders),
            'stats' => [
                'orders_count' => $customer->orders()->count(),
                'total_spent' => (float) $customer->orders()->where('payment_status', 'paid')->sum('grand_total'),
                'reviews_count' => $customer->reviews()->count(),
            ],
        ]);
    }

    /**
     * Toggle the active status of the given customer.
     */
    public function toggleActive(User $customer): RedirectResponse
    {
        abort_unless($customer->hasRole('customer'), 404);

        $customer->forceFill(['is_active' => ! $customer->is_active])->save();

        $state = $customer->is_active ? 'activated' : 'deactivated';

        return back()->with('success', "Customer \"{$customer->name}\" {$state}.");
    }
}
