<?php

namespace App\Mail;

use App\Enums\OrderStatus;
use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Sent to the customer whenever an order moves to a new status.
 */
final class OrderStatusUpdated extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Order $order,
        public OrderStatus $previousStatus,
        public OrderStatus $newStatus,
        public ?string $note = null,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: sprintf('Order %s: %s', $this->order->number, $this->newStatus->label()),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.order-status-updated',
        );
    }
}
