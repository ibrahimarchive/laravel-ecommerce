<?php

namespace App\Enums;

enum PaymentMethod: string
{
    case CashOnDelivery = 'cod';
    case BankTransfer = 'bank_transfer';
    case Stripe = 'stripe';

    /**
     * Get the human readable label for the payment method.
     */
    public function label(): string
    {
        return match ($this) {
            self::CashOnDelivery => 'Cash on Delivery',
            self::BankTransfer => 'Bank Transfer',
            self::Stripe => 'Credit / Debit Card',
        };
    }

    /**
     * Determine whether the method captures funds immediately at checkout.
     */
    public function isOffline(): bool
    {
        return $this !== self::Stripe;
    }

    /**
     * Determine whether the method requires a redirect to an external gateway.
     */
    public function requiresGateway(): bool
    {
        return $this === self::Stripe;
    }

    /**
     * Get every method as a value/label pair for form selects.
     *
     * @return array<int, array<string, string>>
     */
    public static function options(): array
    {
        return array_map(
            fn (self $method) => ['value' => $method->value, 'label' => $method->label()],
            self::cases(),
        );
    }
}
