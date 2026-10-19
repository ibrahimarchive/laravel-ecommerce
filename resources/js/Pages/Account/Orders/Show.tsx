import { Head, Link } from '@inertiajs/react';
import AccountLayout from '../../../Layouts/AccountLayout';

interface OrderItem {
    id: number;
    url?: string | null;
    product_name: string;
    variant_name?: string | null;
    sku?: string | null;
    quantity: number;
    unit_price_formatted: string;
    total_formatted: string;
}

interface StatusHistoryEntry {
    id: number;
    to_status_label: string;
    note?: string | null;
    created_at: string;
}

interface ShippingAddress {
    first_name?: string | null;
    last_name?: string | null;
    company?: string | null;
    address_line_1?: string | null;
    address_line_2?: string | null;
    city?: string | null;
    state?: string | null;
    postal_code?: string | null;
    country?: string | null;
    phone?: string | null;
}

interface Order {
    number: string;
    placed_at: string | null;
    status_label: string;
    payment_status_label: string;
    items: OrderItem[];
    status_history?: StatusHistoryEntry[] | null;
    totals_formatted: {
        subtotal: string;
        discount_total: string;
        tax_total: string;
        shipping_total: string;
        grand_total: string;
    };
    discount_total: number | string;
    coupon_code?: string | null;
    shipping_address?: ShippingAddress | null;
    tracking_number?: string | null;
    carrier?: string | null;
}

interface Props {
    order: Order;
}

export default function OrderShow({ order }: Props) {
    const formatDate = (value: string | null | undefined) => (value ? new Date(value).toLocaleString() : '—');

    return (
        <AccountLayout>
            <Head title={`Order ${order.number}`} />

            <Link href="/account/orders" className="text-sm font-semibold text-umber-700 hover:text-umber-600">← Back to orders</Link>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="title text-2xl">Order {order.number}</h1>
                    <p className="mt-1 text-sm text-ink-500">Placed {formatDate(order.placed_at)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-bone-100 px-3 py-1 text-xs font-semibold text-ink-700">{order.status_label}</span>
                    <span className="rounded-full bg-bone-100 px-3 py-1 text-xs font-semibold text-ink-700">{order.payment_status_label}</span>
                </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <div className="overflow-hidden card-surface">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-bone-300 bg-bone-50 text-xs uppercase tracking-wide text-ink-500">
                                <tr>
                                    <th className="px-4 py-3">Item</th>
                                    <th className="px-4 py-3 text-center">Qty</th>
                                    <th className="px-4 py-3 text-right">Price</th>
                                    <th className="px-4 py-3 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-bone-100">
                                {order.items.map((item) => (
                                    <tr key={item.id}>
                                        <td className="px-4 py-3">
                                            {item.url ? (
                                                <Link href={item.url} className="font-semibold text-ink-950 hover:text-umber-700">{item.product_name}</Link>
                                            ) : (
                                                <span className="font-semibold text-ink-950">{item.product_name}</span>
                                            )}
                                            {item.variant_name && <p className="text-xs text-ink-500">{item.variant_name}</p>}
                                            {item.sku && <p className="text-xs text-ink-400">SKU: {item.sku}</p>}
                                        </td>
                                        <td className="px-4 py-3 text-center text-ink-600">{item.quantity}</td>
                                        <td className="px-4 py-3 text-right text-ink-600">{item.unit_price_formatted}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-ink-950">{item.total_formatted}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {order.status_history?.length ? (
                        <div className="card-surface p-6">
                            <h2 className="text-lg font-semibold text-ink-950">Order timeline</h2>
                            <ol className="mt-4 space-y-4">
                                {order.status_history.map((entry) => (
                                    <li key={entry.id} className="flex gap-3">
                                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-umber-600"></span>
                                        <div>
                                            <p className="text-sm font-semibold text-ink-950">{entry.to_status_label}</p>
                                            {entry.note && <p className="text-sm text-ink-600">{entry.note}</p>}
                                            <p className="text-xs text-ink-400">{formatDate(entry.created_at)}</p>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    ) : null}
                </div>

                <div className="space-y-6">
                    <div className="card-surface p-6">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">Summary</h2>
                        <dl className="mt-4 space-y-2 text-sm">
                            <div className="flex justify-between"><dt className="text-ink-600">Subtotal</dt><dd className="font-medium text-ink-950">{order.totals_formatted.subtotal}</dd></div>
                            {Number(order.discount_total) > 0 && (
                                <div className="flex justify-between"><dt className="text-ink-600">Discount{order.coupon_code && <span> ({order.coupon_code})</span>}</dt><dd className="font-medium text-umber-600">−{order.totals_formatted.discount_total}</dd></div>
                            )}
                            <div className="flex justify-between"><dt className="text-ink-600">Tax</dt><dd className="font-medium text-ink-950">{order.totals_formatted.tax_total}</dd></div>
                            <div className="flex justify-between"><dt className="text-ink-600">Shipping</dt><dd className="font-medium text-ink-950">{order.totals_formatted.shipping_total}</dd></div>
                            <div className="flex justify-between border-t border-bone-300 pt-2 text-base"><dt className="font-semibold text-ink-950">Total</dt><dd className="font-bold text-ink-950">{order.totals_formatted.grand_total}</dd></div>
                        </dl>
                    </div>

                    <div className="card-surface p-6">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">Shipping address</h2>
                        {order.shipping_address && (
                            <address className="mt-3 text-sm not-italic leading-relaxed text-ink-600">
                                <span className="block font-semibold text-ink-950">{order.shipping_address.first_name} {order.shipping_address.last_name}</span>
                                {order.shipping_address.company && <span className="block">{order.shipping_address.company}</span>}
                                <span className="block">{order.shipping_address.address_line_1}</span>
                                {order.shipping_address.address_line_2 && <span className="block">{order.shipping_address.address_line_2}</span>}
                                <span className="block">
                                    {order.shipping_address.city}
                                    {order.shipping_address.state ? `, ${order.shipping_address.state}` : null}{' '}
                                    {order.shipping_address.postal_code}
                                </span>
                                <span className="block">{order.shipping_address.country}</span>
                                {order.shipping_address.phone && <span className="mt-2 block">{order.shipping_address.phone}</span>}
                            </address>
                        )}
                    </div>

                    {order.tracking_number && (
                        <div className="card-surface p-6">
                            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">Tracking</h2>
                            {order.carrier && <p className="mt-3 text-sm text-ink-600">{order.carrier}</p>}
                            <p className="text-sm font-semibold text-ink-950">{order.tracking_number}</p>
                        </div>
                    )}
                </div>
            </div>
        </AccountLayout>
    );
}
