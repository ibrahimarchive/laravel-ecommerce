<?php

namespace App\Enums;

enum OrderStatus: string
{
    case Pending = 'pending';
    case Processing = 'processing';
    case Shipped = 'shipped';
    case Delivered = 'delivered';
    case Cancelled = 'cancelled';
    case Refunded = 'refunded';

    /**
     * Get the human readable label for the status.
     */
    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pending',
            self::Processing => 'Processing',
            self::Shipped => 'Shipped',
            self::Delivered => 'Delivered',
            self::Cancelled => 'Cancelled',
            self::Refunded => 'Refunded',
        };
    }

    /**
     * Get the badge colour used by the admin and customer interfaces.
     */
    public function color(): string
    {
        return match ($this) {
            self::Pending => 'amber',
            self::Processing => 'blue',
            self::Shipped => 'indigo',
            self::Delivered => 'green',
            self::Cancelled => 'red',
            self::Refunded => 'slate',
        };
    }

    /**
     * Determine whether the order is still open for fulfilment.
     */
    public function isFulfillable(): bool
    {
        return in_array($this, [self::Pending, self::Processing, self::Shipped], true);
    }

    /**
     * Determine whether the order reached a terminal state.
     */
    public function isFinal(): bool
    {
        return in_array($this, [self::Delivered, self::Cancelled, self::Refunded], true);
    }

    /**
     * Get the statuses an order may transition to from the current status.
     *
     * @return array<int, self>
     */
    public function allowedTransitions(): array
    {
        return match ($this) {
            self::Pending => [self::Processing, self::Cancelled],
            self::Processing => [self::Shipped, self::Cancelled],
            self::Shipped => [self::Delivered, self::Cancelled],
            self::Delivered => [self::Refunded],
            self::Cancelled, self::Refunded => [],
        };
    }

    /**
     * Determine whether the order may move to the given status.
     */
    public function canTransitionTo(self $status): bool
    {
        return in_array($status, $this->allowedTransitions(), true);
    }

    /**
     * Get every status as a value/label pair for form selects.
     *
     * @return array<int, array<string, string>>
     */
    public static function options(): array
    {
        return array_map(
            fn (self $status) => ['value' => $status->value, 'label' => $status->label()],
            self::cases(),
        );
    }
}
