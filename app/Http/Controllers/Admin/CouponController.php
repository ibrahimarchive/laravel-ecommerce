<?php

namespace App\Http\Controllers\Admin;

use App\Enums\DiscountType;
use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CouponController extends Controller
{
    /**
     * Display a listing of coupons.
     */
    public function index(Request $request): Response
    {
        $filters = [
            'q' => $request->string('q')->trim()->value() ?: null,
            'status' => $request->string('status')->value() ?: null,
        ];

        $coupons = Coupon::query()
            ->withCount('orders')
            ->when($filters['q'], fn ($query, $term) => $query->where('code', 'like', '%'.Str::upper($term).'%'))
            ->when($filters['status'] === 'active', fn ($query) => $query->where('is_active', true))
            ->when($filters['status'] === 'inactive', fn ($query) => $query->where('is_active', false))
            ->latest('id')
            ->get()
            ->map(fn (Coupon $coupon): array => [
                'id' => $coupon->id,
                'code' => $coupon->code,
                'name' => $coupon->name,
                'type' => $coupon->type->value,
                'value' => (float) $coupon->value,
                'value_label' => $coupon->valueLabel(),
                'min_order_total' => $coupon->min_order_total !== null ? (float) $coupon->min_order_total : null,
                'used_count' => $coupon->used_count,
                'usage_limit' => $coupon->usage_limit,
                'orders_count' => $coupon->orders_count,
                'is_active' => (bool) $coupon->is_active,
                'is_redeemable' => $coupon->isRedeemable(),
                'starts_at' => $coupon->starts_at?->toDateString(),
                'expires_at' => $coupon->expires_at?->toDateString(),
            ]);

        return Inertia::render('Admin/Coupons/Index', [
            'coupons' => $coupons,
            'filters' => $filters,
        ]);
    }

    /**
     * Show the form for creating a new coupon.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/Coupons/Create', [
            'types' => DiscountType::options(),
        ]);
    }

    /**
     * Store a newly created coupon.
     */
    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);

        $coupon = Coupon::create($this->attributes($data));

        return redirect()
            ->route('admin.coupons.index')
            ->with('success', "Coupon \"{$coupon->code}\" created successfully.");
    }

    /**
     * Show the form for editing the given coupon.
     */
    public function edit(Coupon $coupon): Response
    {
        return Inertia::render('Admin/Coupons/Edit', [
            'coupon' => [
                'id' => $coupon->id,
                'code' => $coupon->code,
                'name' => $coupon->name,
                'description' => $coupon->description,
                'type' => $coupon->type->value,
                'value' => (float) $coupon->value,
                'min_order_total' => $coupon->min_order_total !== null ? (float) $coupon->min_order_total : null,
                'max_discount_amount' => $coupon->max_discount_amount !== null ? (float) $coupon->max_discount_amount : null,
                'usage_limit' => $coupon->usage_limit,
                'usage_limit_per_user' => $coupon->usage_limit_per_user,
                'is_active' => (bool) $coupon->is_active,
                'starts_at' => $coupon->starts_at?->toDateString(),
                'expires_at' => $coupon->expires_at?->toDateString(),
            ],
            'types' => DiscountType::options(),
        ]);
    }

    /**
     * Update the given coupon.
     */
    public function update(Request $request, Coupon $coupon): RedirectResponse
    {
        $data = $this->validated($request, $coupon);

        $coupon->update($this->attributes($data));

        return back()->with('success', "Coupon \"{$coupon->code}\" updated successfully.");
    }

    /**
     * Delete the given coupon.
     */
    public function destroy(Coupon $coupon): RedirectResponse
    {
        $code = $coupon->code;
        $coupon->delete();

        return redirect()
            ->route('admin.coupons.index')
            ->with('success', "Coupon \"{$code}\" deleted.");
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request, ?Coupon $coupon = null): array
    {
        return $request->validate([
            'code' => ['required', 'string', 'max:255', Rule::unique('coupons', 'code')->ignore($coupon?->id)],
            'name' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'type' => ['required', Rule::enum(DiscountType::class)],
            'value' => ['required', 'numeric', 'min:0'],
            'min_order_total' => ['nullable', 'numeric', 'min:0'],
            'max_discount_amount' => ['nullable', 'numeric', 'min:0'],
            'usage_limit' => ['nullable', 'integer', 'min:1'],
            'usage_limit_per_user' => ['nullable', 'integer', 'min:1'],
            'is_active' => ['boolean'],
            'starts_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
        ]);
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function attributes(array $data): array
    {
        return [
            'code' => Str::upper(trim($data['code'])),
            'name' => $data['name'] ?? null,
            'description' => $data['description'] ?? null,
            'type' => $data['type'],
            'value' => $data['value'],
            'min_order_total' => $data['min_order_total'] ?? null,
            'max_discount_amount' => $data['max_discount_amount'] ?? null,
            'usage_limit' => $data['usage_limit'] ?? null,
            'usage_limit_per_user' => $data['usage_limit_per_user'] ?? null,
            'is_active' => (bool) ($data['is_active'] ?? false),
            'starts_at' => $data['starts_at'] ?? null,
            'expires_at' => $data['expires_at'] ?? null,
        ];
    }
}
