<?php

namespace App\Services;

use App\Enums\PaymentMethod;
use App\Models\Order;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Handles the payment lifecycle of an order across the supported gateways.
 *
 * Offline methods (cash on delivery and bank transfer) are settled manually,
 * while Stripe is driven through its hosted Checkout API when configured.
 */
final class PaymentService
{
    /**
     * The payment methods that can currently be offered at checkout.
     *
     * @return array<int, array{value: string, label: string}>
     */
    public function availableMethods(): array
    {
        return array_values(array_filter(
            PaymentMethod::options(),
            fn (array $option): bool => $option['value'] !== PaymentMethod::Stripe->value || $this->stripeIsConfigured()
        ));
    }

    public function stripeIsConfigured(): bool
    {
        return filled(config('services.stripe.secret')) && filled(config('services.stripe.key'));
    }

    /**
     * Whether the given method settles without an online gateway.
     */
    public function isOffline(PaymentMethod $method): bool
    {
        return $method->isOffline();
    }

    /**
     * Begin payment for an order, returning a URL to redirect the customer to
     * when the chosen method requires a hosted gateway.
     */
    public function begin(Order $order): ?string
    {
        if ($order->payment_method === PaymentMethod::Stripe && $this->stripeIsConfigured()) {
            return $this->createStripeCheckoutSession($order);
        }

        return null;
    }

    public function markPaid(Order $order, ?string $reference = null): Order
    {
        $order->markAsPaid($order->payment_method ?? PaymentMethod::CashOnDelivery, $reference);

        return $order;
    }

    public function markFailed(Order $order, ?string $reference = null): Order
    {
        $order->markPaymentFailed($reference);

        return $order;
    }

    /**
     * Verify a completed Stripe Checkout session and mark the order paid.
     */
    public function confirmStripeSession(Order $order, string $sessionId): bool
    {
        if (! $this->stripeIsConfigured()) {
            return false;
        }

        $response = Http::withToken(config('services.stripe.secret'))
            ->get("https://api.stripe.com/v1/checkout/sessions/{$sessionId}");

        if ($response->failed() || $response->json('payment_status') !== 'paid') {
            return false;
        }

        $this->markPaid($order, $response->json('payment_intent') ?? $sessionId);

        return true;
    }

    private function createStripeCheckoutSession(Order $order): ?string
    {
        $response = Http::asForm()
            ->withToken(config('services.stripe.secret'))
            ->post('https://api.stripe.com/v1/checkout/sessions', [
                'mode' => 'payment',
                'success_url' => route('checkout.success', $order).'?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => route('checkout.cancel', $order),
                'customer_email' => $order->customer_email,
                'line_items' => [[
                    'price_data' => [
                        'currency' => strtolower($order->currency),
                        'unit_amount' => (int) round((float) $order->grand_total * 100),
                        'product_data' => ['name' => 'Order '.$order->number],
                    ],
                    'quantity' => 1,
                ]],
                'metadata' => ['order_number' => $order->number],
            ]);

        if ($response->failed()) {
            report(new RuntimeException('Stripe checkout session creation failed: '.$response->body()));

            return null;
        }

        $order->forceFill(['payment_reference' => $response->json('id')])->save();

        return $response->json('url');
    }
}
