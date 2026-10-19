<?php

namespace App\Http\Resources;

use App\Models\Order;
use App\Support\Store;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Collection;

/**
 * @mixin Order
 */
class OrderResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'number' => $this->number,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'status_color' => $this->status->color(),
            'payment_status' => $this->payment_status->value,
            'payment_status_label' => $this->payment_status->label(),
            'payment_status_color' => $this->payment_status->color(),
            'payment_method' => $this->payment_method?->value,
            'payment_method_label' => $this->payment_method?->label(),
            'customer_name' => $this->customer_name,
            'customer_email' => $this->customer_email,
            'customer_phone' => $this->customer_phone,
            'currency' => $this->currency,
            'items_count' => $this->items_count,
            'subtotal' => (float) $this->subtotal,
            'discount_total' => (float) $this->discount_total,
            'tax_total' => (float) $this->tax_total,
            'shipping_total' => (float) $this->shipping_total,
            'grand_total' => (float) $this->grand_total,
            'amount_paid' => (float) $this->amount_paid,
            'amount_due' => $this->amountDue(),
            'coupon_code' => $this->coupon_code,
            'shipping_method' => $this->shipping_method,
            'tracking_number' => $this->tracking_number,
            'carrier' => $this->carrier,
            'customer_note' => $this->customer_note,
            'admin_note' => $this->when($request->user()?->isAdmin(), $this->admin_note),
            'shipping_address' => $this->shipping_address,
            'billing_address' => $this->billing_address,
            'placed_at' => $this->placed_at?->toIso8601String(),
            'paid_at' => $this->paid_at?->toIso8601String(),
            'shipped_at' => $this->shipped_at?->toIso8601String(),
            'delivered_at' => $this->delivered_at?->toIso8601String(),
            'cancelled_at' => $this->cancelled_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'totals_formatted' => [
                'subtotal' => Store::money($this->subtotal),
                'discount_total' => Store::money($this->discount_total),
                'tax_total' => Store::money($this->tax_total),
                'shipping_total' => Store::money($this->shipping_total),
                'grand_total' => Store::money($this->grand_total),
                'amount_due' => Store::money($this->amountDue()),
                'amount_paid' => Store::money($this->amount_paid),
            ],
            'items' => $this->whenLoaded('items', fn (): Collection => $this->items->map(fn ($item): array => [
                'id' => $item->id,
                'product_name' => $item->product_name,
                'variant_name' => $item->variant_name,
                'sku' => $item->sku,
                'options' => $item->options,
                'unit_price' => (float) $item->unit_price,
                'quantity' => $item->quantity,
                'total' => (float) $item->total,
                'unit_price_formatted' => Store::money($item->unit_price),
                'total_formatted' => Store::money($item->total),
                'url' => $item->productUrl(),
            ])->values()),
            'status_history' => $this->whenLoaded('statusHistories', fn (): Collection => $this->statusHistories->map(fn ($history): array => [
                'id' => $history->id,
                'from_status' => $history->from_status?->value,
                'to_status' => $history->to_status->value,
                'to_status_label' => $history->to_status->label(),
                'note' => $history->note,
                'created_at' => $history->created_at?->toIso8601String(),
            ])->values()),
        ];
    }
}
