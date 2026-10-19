<?php

namespace App\Models;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use Database\Factories\OrderFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

#[Fillable([
    'number', 'user_id', 'customer_name', 'customer_email', 'customer_phone',
    'status', 'payment_status', 'payment_method', 'payment_reference',
    'coupon_id', 'coupon_code', 'shipping_address_id', 'billing_address_id',
    'shipping_address', 'billing_address', 'currency', 'items_count',
    'subtotal', 'discount_total', 'tax_total', 'shipping_total', 'grand_total',
    'amount_paid', 'shipping_method', 'tracking_number', 'carrier',
    'customer_note', 'admin_note', 'placed_at', 'paid_at', 'shipped_at',
    'delivered_at', 'cancelled_at', 'refunded_at',
])]
class Order extends Model
{
    /** @use HasFactory<OrderFactory> */
    use HasFactory, SoftDeletes;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => OrderStatus::class,
            'payment_status' => PaymentStatus::class,
            'payment_method' => PaymentMethod::class,
            'shipping_address' => 'array',
            'billing_address' => 'array',
            'items_count' => 'integer',
            'subtotal' => 'decimal:2',
            'discount_total' => 'decimal:2',
            'tax_total' => 'decimal:2',
            'shipping_total' => 'decimal:2',
            'grand_total' => 'decimal:2',
            'amount_paid' => 'decimal:2',
            'placed_at' => 'datetime',
            'paid_at' => 'datetime',
            'shipped_at' => 'datetime',
            'delivered_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'refunded_at' => 'datetime',
        ];
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'number';
    }

    /**
     * Get the user who placed the order.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the coupon applied to the order.
     *
     * @return BelongsTo<Coupon, $this>
     */
    public function coupon(): BelongsTo
    {
        return $this->belongsTo(Coupon::class);
    }

    /**
     * Get the saved shipping address record.
     *
     * @return BelongsTo<Address, $this>
     */
    public function shippingAddress(): BelongsTo
    {
        return $this->belongsTo(Address::class, 'shipping_address_id');
    }

    /**
     * Get the saved billing address record.
     *
     * @return BelongsTo<Address, $this>
     */
    public function billingAddress(): BelongsTo
    {
        return $this->belongsTo(Address::class, 'billing_address_id');
    }

    /**
     * Get the line items belonging to the order.
     *
     * @return HasMany<OrderItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class)->orderBy('id');
    }

    /**
     * Get the status change history for the order.
     *
     * @return HasMany<OrderStatusHistory, $this>
     */
    public function statusHistories(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class)->latest('id');
    }

    /**
     * Scope the query to orders in the given status.
     *
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    #[Scope]
    protected function withStatus(Builder $query, OrderStatus $status): Builder
    {
        return $query->where('status', $status->value);
    }

    /**
     * Scope the query to orders still being fulfilled.
     *
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    #[Scope]
    protected function open(Builder $query): Builder
    {
        return $query->whereIn('status', [
            OrderStatus::Pending->value,
            OrderStatus::Processing->value,
            OrderStatus::Shipped->value,
        ]);
    }

    /**
     * Scope the query to orders that have been paid for.
     *
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    #[Scope]
    protected function paid(Builder $query): Builder
    {
        return $query->where('payment_status', PaymentStatus::Paid->value);
    }

    /**
     * Scope the query to orders awaiting payment.
     *
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    #[Scope]
    protected function awaitingPayment(Builder $query): Builder
    {
        return $query->where('payment_status', PaymentStatus::Pending->value);
    }

    /**
     * Scope the query to orders placed within the given number of days.
     *
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    #[Scope]
    protected function placedWithinDays(Builder $query, int $days): Builder
    {
        return $query->where('placed_at', '>=', now()->subDays($days));
    }

    /**
     * Scope the query to orders matching a search term by number, name or email.
     *
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    #[Scope]
    protected function search(Builder $query, string $term): Builder
    {
        $like = '%'.Str::lower(trim($term)).'%';

        return $query->where(fn (Builder $query) => $query
            ->whereRaw('LOWER(number) LIKE ?', [$like])
            ->orWhereRaw('LOWER(customer_name) LIKE ?', [$like])
            ->orWhereRaw('LOWER(customer_email) LIKE ?', [$like]));
    }

    /**
     * Determine whether the order has been fully paid.
     */
    public function isPaid(): bool
    {
        return $this->payment_status === PaymentStatus::Paid;
    }

    /**
     * Determine whether the order can still be cancelled.
     */
    public function isCancellable(): bool
    {
        return $this->status->isFulfillable() && $this->status !== OrderStatus::Shipped;
    }

    /**
     * Determine whether the order can still be refunded.
     */
    public function isRefundable(): bool
    {
        return $this->isPaid()
            && in_array($this->status, [OrderStatus::Delivered, OrderStatus::Shipped], true);
    }

    /**
     * Get the outstanding balance on the order.
     */
    public function amountDue(): float
    {
        return round(max(0, (float) $this->grand_total - (float) $this->amount_paid), 2);
    }

    /**
     * Mark the order as paid and record the payment details.
     */
    public function markAsPaid(PaymentMethod $method, ?string $reference = null): void
    {
        $this->forceFill([
            'payment_status' => PaymentStatus::Paid,
            'payment_method' => $method,
            'payment_reference' => $reference,
            'amount_paid' => $this->grand_total,
            'paid_at' => now(),
        ])->save();
    }

    /**
     * Record a failed payment attempt without changing the order status.
     */
    public function markPaymentFailed(?string $reference = null): void
    {
        $this->forceFill([
            'payment_status' => PaymentStatus::Failed,
            'payment_reference' => $reference,
        ])->save();
    }

    /**
     * Move the order to the given status, stamping the matching timestamp.
     */
    public function transitionTo(OrderStatus $status, ?string $note = null, ?int $actorId = null): bool
    {
        $current = $this->status;

        if ($current === $status) {
            return false;
        }

        if (! $current->canTransitionTo($status)) {
            return false;
        }

        $timestamps = match ($status) {
            OrderStatus::Processing => [],
            OrderStatus::Shipped => ['shipped_at' => now()],
            OrderStatus::Delivered => ['delivered_at' => now()],
            OrderStatus::Cancelled => ['cancelled_at' => now()],
            OrderStatus::Refunded => ['refunded_at' => now()],
            OrderStatus::Pending => [],
        };

        $this->forceFill(['status' => $status, ...$timestamps])->save();

        $this->statusHistories()->create([
            'user_id' => $actorId,
            'from_status' => $current->value,
            'to_status' => $status->value,
            'note' => $note,
        ]);

        return true;
    }

    /**
     * Get a human readable label describing the order status.
     */
    public function statusLabel(): string
    {
        return $this->status->label();
    }

    /**
     * Generate a unique order number.
     */
    public static function generateNumber(): string
    {
        $prefix = 'ORD-'.now()->format('Ymd').'-';

        do {
            $number = $prefix.Str::upper(Str::random(6));
        } while (self::withTrashed()->where('number', $number)->exists());

        return $number;
    }
}
