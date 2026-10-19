@php
    use App\Support\Store;
@endphp
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Order update</title>
</head>
<body style="margin:0;padding:24px;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;">
        <tr>
            <td style="padding:28px 28px 8px;">
                <h1 style="margin:0;font-size:22px;color:#0f172a;">{{ Store::name() }}</h1>
                <p style="margin:6px 0 0;font-size:14px;color:#64748b;">Hi {{ $order->customer_name }},</p>
            </td>
        </tr>
        <tr>
            <td style="padding:12px 28px;">
                <p style="margin:0;font-size:15px;">
                    Your order <strong>{{ $order->number }}</strong> is now
                    <strong style="color:#4f46e5;">{{ $newStatus->label() }}</strong>.
                </p>

                @if ($note)
                    <p style="margin:12px 0 0;padding:12px 16px;background:#f8fafc;border-left:3px solid #4f46e5;font-size:14px;color:#334155;">
                        {{ $note }}
                    </p>
                @endif

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0;font-size:14px;">
                    <tr>
                        <td style="padding:4px 0;color:#64748b;">Previous status</td>
                        <td style="padding:4px 0;text-align:right;">{{ $previousStatus->label() }}</td>
                    </tr>
                    <tr>
                        <td style="padding:4px 0;color:#64748b;">New status</td>
                        <td style="padding:4px 0;text-align:right;font-weight:bold;">{{ $newStatus->label() }}</td>
                    </tr>
                    @if ($order->tracking_number)
                        <tr>
                            <td style="padding:4px 0;color:#64748b;">Tracking number</td>
                            <td style="padding:4px 0;text-align:right;">{{ $order->tracking_number }}</td>
                        </tr>
                    @endif
                    @if ($order->carrier)
                        <tr>
                            <td style="padding:4px 0;color:#64748b;">Carrier</td>
                            <td style="padding:4px 0;text-align:right;">{{ $order->carrier }}</td>
                        </tr>
                    @endif
                    <tr style="border-top:1px solid #e2e8f0;">
                        <td style="padding:10px 0;font-weight:bold;">Order total</td>
                        <td style="padding:10px 0;text-align:right;font-weight:bold;">{{ Store::money($order->grand_total) }}</td>
                    </tr>
                </table>
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
