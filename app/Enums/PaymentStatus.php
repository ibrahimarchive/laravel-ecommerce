<?php

namespace App\Enums;

enum PaymentStatus: string
{
    case Pending = 'pending';
    case Paid = 'paid';
    case Failed = 'failed';
    case Refunded = 'refunded';

    /**
     * Get the human readable label for the status.
     */
    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pending',
            self::Paid => 'Paid',
            self::Failed => 'Failed',
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
            self::Paid => 'green',
            self::Failed => 'red',
            self::Refunded => 'slate',
        };
    }

    /**
     * Determine whether the payment has been captured.
     */
    public function isPaid(): bool
    {
        return $this === self::Paid;
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
