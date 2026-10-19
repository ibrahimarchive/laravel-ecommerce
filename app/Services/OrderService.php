<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Mail\OrderPlaced;
use App\Mail\OrderStatusUpdated;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\User;
use App\Support\Store;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use RuntimeException;
use Throwable;

/**
 * Creates orders from carts and manages order state transitions.
 */
final class OrderService
{
    public function __construct(
        private readonly CartService $carts,
    ) {}

    /**
     * Place an order for the given cart inside a database transaction.
     *
     * @param  array{
     *     customer_name: string,
     *     customer_email: string,
     *     customer_phone?: ?string,
     *     shipping_address?: ?array<string, mixed>,
     *     billing_address?: ?array<string, mixed>,
     *     shipping_address_id?: ?int,
     *     billing_address_id?: ?int,
     *     shipping_method?: ?string,
     *     payment_method: PaymentMethod|string,
     *     customer_note?: ?string,
     * }  $data
     */
    public function place(Cart $cart, array $data, ?User $user = null): Order
    {
        $order = DB::transaction(function () use ($cart, $data, $user): Order {
            $cart->load(['items.product', 'items.variant.attributeValues.attribute', 'coupon']);

            $shippingMethod = $data['shipping_method'] ?? $cart->shipping_method;
            $cart->forceFill(['shipping_method' => $shippingMethod])->save();

            $totals = $this->carts->totals($cart);

            if ($totals->isEmpty()) {
                throw new RuntimeException('Cannot place an order with an empty cart.');
            }

            foreach ($cart->items as $item) {
                if ($item->exceedsStock()) {
                    throw new RuntimeException(sprintf(
                        '"%s" does not have enough stock available.',
                        $item->displayName()
                    ));
                }
            }

            $paymentMethod = $data['payment_method'] instanceof PaymentMethod
                ? $data['payment_method']
                : PaymentMethod::from($data['payment_method']);

            $order = Order::create([
                'number' => Order::generateNumber(),
                'user_id' => $user?->id,
                'customer_name' => $data['customer_name'],
                'customer_email' => $data['customer_email'],
                'customer_phone' => $data['customer_phone'] ?? null,
                'status' => OrderStatus::Pending,
                'payment_status' => PaymentStatus::Pending,
                'payment_method' => $paymentMethod,
                'coupon_id' => $cart->coupon_id,
                'coupon_code' => $cart->coupon?->code,
                'shipping_address_id' => $data['shipping_address_id'] ?? null,
                'billing_address_id' => $data['billing_address_id'] ?? null,
                'shipping_address' => $data['shipping_address'] ?? null,
                'billing_address' => $data['billing_address'] ?? null,
                'currency' => $data['currency'] ?? Store::currency()['code'],
                'items_count' => $totals->itemsCount,
                'subtotal' => $totals->subtotal,
                'discount_total' => $totals->discountTotal,
                'tax_total' => $totals->taxTotal,
                'shipping_total' => $totals->shippingTotal,
                'grand_total' => $totals->grandTotal,
                'amount_paid' => 0,
                'shipping_method' => $shippingMethod,
                'customer_note' => $data['customer_note'] ?? null,
                'placed_at' => now(),
            ]);

            foreach ($cart->items as $item) {
                $this->createOrderItem($order, $item);
                $this->decrementStock($item);
            }

            $this->recordCouponUsage($cart);

            $order->statusHistories()->create([
                'user_id' => $user?->id,
                'from_status' => null,
                'to_status' => OrderStatus::Pending,
                'note' => 'Order placed.',
            ]);

            $this->carts->clear($cart);

            return $order->load('items');
        });

        $this->sendOrderPlacedEmail($order);

        return $order;
    }

    /**
     * Move an order to a new status, restocking when it is cancelled.
     */
    public function transition(Order $order, OrderStatus $status, ?string $note = null, ?int $actorId = null): Order
    {
        if (! $order->status->canTransitionTo($status)) {
            throw new RuntimeException(sprintf(
                'Cannot move an order from %s to %s.',
                $order->status->label(),
                $status->label()
            ));
        }

        if ($status === OrderStatus::Cancelled) {
            $this->restock($order);
        }

        $previous = $order->status;

        $order->transitionTo($status, $note, $actorId);

        $this->sendStatusUpdatedEmail($order, $previous, $status, $note);

        return $order;
    }

    /**
     * Return the ordered quantities back to inventory.
     */
    public function restock(Order $order): void
    {
        $order->load(['items.product', 'items.variant']);

        foreach ($order->items as $item) {
            if ($item->product_variant_id !== null && $item->variant) {
                $item->variant->increment('stock_quantity', $item->quantity);
            } elseif ($item->product && $item->product->manage_stock) {
                $item->product->increment('stock_quantity', $item->quantity);
            }
        }
    }

    /**
     * Email the customer a receipt for a freshly placed order.
     */
    private function sendOrderPlacedEmail(Order $order): void
    {
        if (! Store::sendOrderConfirmation()) {
            return;
        }

        try {
            $mail = Mail::to($order->customer_email);

            $notificationEmail = Store::orderNotificationEmail();

            if ($notificationEmail !== '' && $notificationEmail !== $order->customer_email) {
                $mail->cc($notificationEmail);
            }

            $mail->send(new OrderPlaced($order));
        } catch (Throwable $exception) {
            report($exception);
        }
    }

    /**
     * Email the customer that an order moved to a new status.
     */
    private function sendStatusUpdatedEmail(Order $order, OrderStatus $from, OrderStatus $to, ?string $note): void
    {
        try {
            Mail::to($order->customer_email)->send(new OrderStatusUpdated($order, $from, $to, $note));
        } catch (Throwable $exception) {
            report($exception);

            return;
        }

        $order->statusHistories()->latest('id')->first()?->forceFill([
            'is_customer_notified' => true,
        ])->save();
    }

    private function createOrderItem(Order $order, CartItem $item): void
    {
        $product = $item->product;
        $variant = $item->variant;
        $lineTotal = round((float) $item->unit_price * $item->quantity, 2);

        $order->items()->create([
            'product_id' => $product?->id,
            'product_variant_id' => $variant?->id,
            'product_name' => $product?->name ?? $item->displayName(),
            'variant_name' => $variant?->label(),
            'sku' => $variant?->sku ?? $product?->sku,
            'options' => $variant
                ? $variant->attributeValues
                    ->map(fn ($value): array => [
                        'name' => $value->attribute?->name,
                        'value' => $value->value,
                    ])
                    ->all()
                : null,
            'unit_price' => $item->unit_price,
            'quantity' => $item->quantity,
            'subtotal' => $lineTotal,
            'discount_total' => 0,
            'tax_total' => 0,
            'total' => $lineTotal,
        ]);
    }

    private function decrementStock(CartItem $item): void
    {
        if ($item->product_variant_id !== null && $item->variant) {
            $item->variant->decrement('stock_quantity', $item->quantity);

            return;
        }

        if ($item->product && $item->product->manage_stock) {
            $item->product->decrement('stock_quantity', $item->quantity);
        }
    }

    private function recordCouponUsage(Cart $cart): void
    {
        if ($cart->coupon_id === null) {
            return;
        }

        $cart->coupon?->increment('used_count');
    }
}
