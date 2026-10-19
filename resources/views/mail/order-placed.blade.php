@php
    use App\Support\Store;

    $currency = Store::currency();
    $address = $order->shipping_address ?? [];
@endphp
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Order confirmation</title>
</head>
<body style="margin:0;padding:24px;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;">
        <tr>
            <td style="padding:28px 28px 8px;">
                <h1 style="margin:0;font-size:22px;color:#0f172a;">{{ Store::name() }}</h1>
                <p style="margin:6px 0 0;font-size:14px;color:#64748b;">Thanks for your order, {{ $order->customer_name }}.</p>
            </td>
        </tr>
        <tr>
            <td style="padding:12px 28px;">
                <p style="margin:0;font-size:14px;">We have received your order and will let you know as soon as it ships.</p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0;font-size:14px;">
                    <tr>
                        <td style="padding:4px 0;color:#64748b;">Order number</td>
                        <td style="padding:4px 0;text-align:right;font-weight:bold;">{{ $order->number }}</td>
                    </tr>
                    <tr>
                        <td style="padding:4px 0;color:#64748b;">Placed</td>
                        <td style="padding:4px 0;text-align:right;">{{ optional($order->placed_at)->format('j M Y') }}</td>
                    </tr>
                    <tr>
                        <td style="padding:4px 0;color:#64748b;">Status</td>
                        <td style="padding:4px 0;text-align:right;">{{ $order->status->label() }}</td>
                    </tr>
                    <tr>
                        <td style="padding:4px 0;color:#64748b;">Payment</td>
                        <td style="padding:4px 0;text-align:right;">{{ $order->payment_method?->label() ?? 'Pending' }}</td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td style="padding:0 28px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;">
                    <thead>
                        <tr style="border-bottom:1px solid #e2e8f0;text-align:left;color:#64748b;">
                            <th style="padding:8px 0;">Item</th>
                            <th style="padding:8px 0;text-align:center;">Qty</th>
                            <th style="padding:8px 0;text-align:right;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($order->items as $item)
                            <tr style="border-bottom:1px solid #f1f5f9;">
                                <td style="padding:8px 0;">
                                    {{ $item->product_name }}
                                    @if ($item->variant_name)
                                        <span style="color:#64748b;">({{ $item->variant_name }})</span>
                                    @endif
                                </td>
                                <td style="padding:8px 0;text-align:center;">{{ $item->quantity }}</td>
                                <td style="padding:8px 0;text-align:right;">{{ Store::money($item->total) }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </td>
        </tr>
        <tr>
            <td style="padding:16px 28px 28px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
                    <tr>
                        <td style="padding:3px 0;color:#64748b;">Subtotal</td>
                        <td style="padding:3px 0;text-align:right;">{{ Store::money($order->subtotal) }}</td>
                    </tr>
                    @if ((float) $order->discount_total > 0)
                        <tr>
                            <td style="padding:3px 0;color:#64748b;">Discount{{ $order->coupon_code ? ' ('.$order->coupon_code.')' : '' }}</td>
                            <td style="padding:3px 0;text-align:right;">&minus;{{ Store::money($order->discount_total) }}</td>
                        </tr>
                    @endif
                    <tr>
                        <td style="padding:3px 0;color:#64748b;">Tax</td>
                        <td style="padding:3px 0;text-align:right;">{{ Store::money($order->tax_total) }}</td>
                    </tr>
                    <tr>
                        <td style="padding:3px 0;color:#64748b;">Shipping</td>
                        <td style="padding:3px 0;text-align:right;">{{ Store::money($order->shipping_total) }}</td>
                    </tr>
                    <tr style="border-top:1px solid #e2e8f0;">
                        <td style="padding:10px 0;font-weight:bold;">Total</td>
                        <td style="padding:10px 0;text-align:right;font-weight:bold;">{{ Store::money($order->grand_total) }}</td>
                    </tr>
                </table>

                @if ($address)
                    <p style="margin:20px 0 0;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:.04em;">Shipping to</p>
                    <p style="margin:6px 0 0;font-size:14px;line-height:1.6;">
                        {{ trim(($address['first_name'] ?? '').' '.($address['last_name'] ?? '')) }}<br>
                        @if (! empty($address['address_line_1'])){{ $address['address_line_1'] }}<br>@endif
                        @if (! empty($address['address_line_2'])){{ $address['address_line_2'] }}<br>@endif
                        @if (! empty($address['city'])){{ $address['city'] }}@if (! empty($address['state'])), {{ $address['state'] }}@endif @if (! empty($address['postal_code'])) {{ $address['postal_code'] }}@endif<br>@endif
                        @if (! empty($address['country'])){{ strtoupper($address['country']) }}@endif
                    </p>
                @endif
            </td>
        </tr>
        <tr>
            <td style="padding:16px 28px;background:#f8fafc;border-top:1px solid #e2e8f0;border-radius:0 0 12px 12px;font-size:12px;color:#64748b;">
                Questions? Reply to this email or contact us at {{ Store::email() }}.
            </td>
        </tr>
    </table>
</body>
</html>
