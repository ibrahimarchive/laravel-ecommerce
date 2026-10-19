<?php

namespace App\Models;

use App\Enums\OrderStatus;
use Database\Factories\OrderStatusHistoryFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'order_id', 'user_id', 'from_status', 'to_status', 'note', 'is_customer_notified',
])]
class OrderStatusHistory extends Model
{
    /** @use HasFactory<OrderStatusHistoryFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'from_status' => OrderStatus::class,
            'to_status' => OrderStatus::class,
            'is_customer_notified' => 'boolean',
        ];
    }

    /**
     * Get the order the history entry belongs to.
     *
     * @return BelongsTo<Order, $this>
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the user who performed the transition.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get a human readable summary of the transition.
     */
    public function summary(): string
    {
        if ($this->from_status === null) {
            return "Order placed as {$this->to_status->label()}";
        }

        return "{$this->from_status->label()} → {$this->to_status->label()}";
    }
}
