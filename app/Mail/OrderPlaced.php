<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Sent to the customer when an order has been placed.
 */
final class OrderPlaced extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Order $order) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: sprintf('Your order %s is confirmed', $this->order->number),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.order-placed',
        );
    }
}
