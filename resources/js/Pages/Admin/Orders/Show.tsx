import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import type { PageProps } from '../../../types';

interface StatusOption {
    value: string;
    label: string;
}

interface OrderItemOption {
    name: string;
    value: string;
}

interface OrderItem {
    id: number;
    product_name: string;
    variant_name?: string | null;
    sku?: string | null;
    options?: OrderItemOption[];
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
    first_name: string;
    last_name: string;
    address_line_1: string;
    address_line_2?: string | null;
    city: string;
    postal_code: string;
    country: string;
}

interface Order {
    number: string;
    status: string;
    status_label: string;
    payment_status: string;
    payment_status_label: string;
    payment_method_label?: string | null;
    placed_at: string;
    customer_name: string;
    customer_email: string;
    customer_phone?: string | null;
    customer_note?: string | null;
    tracking_number?: string | null;
    carrier?: string | null;
    discount_total: number | string;
    coupon_code?: string | null;
    items: OrderItem[];
    status_history?: StatusHistoryEntry[];
    shipping_address?: ShippingAddress | null;
    totals_formatted: {
        subtotal: string;
        discount_total: string;
        tax_total: string;
        shipping_total: string;
        grand_total: string;
        amount_paid: string;
    };
}

interface Props extends PageProps {
    order: Order;
    statuses: StatusOption[];
    allowedTransitions: StatusOption[];
}

export default function OrdersShow({ order, allowedTransitions = [] }: Props) {
    const statusForm = useForm({
        status: allowedTransitions[0]?.value ?? order.status,
        note: '',
        tracking_number: order.tracking_number ?? '',
        carrier: order.carrier ?? '',
    });

    const paymentForm = useForm({
        payment_status: order.payment_status,
        payment_reference: '',
    });

    const submitStatus = () => {
        statusForm.patch(`/admin/orders/${order.number}/status`, { preserveScroll: true });
    };

    const submitPayment = () => {
        paymentForm.patch(`/admin/orders/${order.number}/payment`, { preserveScroll: true });
    };

    const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleString() : '—');

    return (
        <AdminLayout>
            <Head title={`Order ${order.number}`} />

            <Link href="/admin/orders" className="text-sm font-semibold text-umber-700 hover:text-umber-600">← Back to orders</Link>

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
                <div className="space-y-6 lg:col-span-2">
                    <div className="overflow-hidden card-surface">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-bone-300 bg-bone-50 text-xs uppercase tracking-wide text-ink-500">
                                <tr>
                                    <th className="px-4 py-3">Item</th>
                                    <th className="px-4 py-3 text-center">Qty</th>
                                    <th className="px-4 py-3 text-right">Unit</th>
                                    <th className="px-4 py-3 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-bone-100">
                                {order.items.map((item) => (
                                    <tr key={item.id}>
                                        <td className="px-4 py-3">
                                            <p className="font-semibold text-ink-950">{item.product_name}</p>
                                            {item.variant_name ? <p className="text-xs text-ink-500">{item.variant_name}</p> : null}
                                            {item.sku ? <p className="text-xs text-ink-400">SKU: {item.sku}</p> : null}
                                            {item.options?.length ? (
                                                <p className="text-xs text-ink-400">
                                                    {item.options.map((option) => `${option.name}: ${option.value}`).join(', ')}
                                                </p>
                                            ) : null}
                                        </td>
                                        <td className="px-4 py-3 text-center text-ink-600">{item.quantity}</td>
                                        <td className="px-4 py-3 text-right text-ink-600">{item.unit_price_formatted}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-ink-950">{item.total_formatted}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="border-t border-bone-300 bg-bone-50 text-sm">
                                <tr><td colSpan={3} className="px-4 py-2 text-right text-ink-600">Subtotal</td><td className="px-4 py-2 text-right font-medium text-ink-950">{order.totals_formatted.subtotal}</td></tr>
                                {Number(order.discount_total) > 0 && (
                                    <tr><td colSpan={3} className="px-4 py-2 text-right text-ink-600">Discount{order.coupon_code ? <span> ({order.coupon_code})</span> : null}</td><td className="px-4 py-2 text-right font-medium text-umber-600">−{order.totals_formatted.discount_total}</td></tr>
                                )}
                                <tr><td colSpan={3} className="px-4 py-2 text-right text-ink-600">Tax</td><td className="px-4 py-2 text-right font-medium text-ink-950">{order.totals_formatted.tax_total}</td></tr>
                                <tr><td colSpan={3} className="px-4 py-2 text-right text-ink-600">Shipping</td><td className="px-4 py-2 text-right font-medium text-ink-950">{order.totals_formatted.shipping_total}</td></tr>
                                <tr><td colSpan={3} className="px-4 py-3 text-right font-semibold text-ink-950">Grand total</td><td className="px-4 py-3 text-right text-base font-bold text-ink-950">{order.totals_formatted.grand_total}</td></tr>
                                <tr><td colSpan={3} className="px-4 py-2 text-right text-ink-600">Amount paid</td><td className="px-4 py-2 text-right font-medium text-ink-950">{order.totals_formatted.amount_paid}</td></tr>
                            </tfoot>
                        </table>
                    </div>

                    <div className="card-surface p-6">
                        <h2 className="text-lg font-semibold text-ink-950">Status timeline</h2>
                        {order.status_history?.length ? (
                            <ol className="mt-4 space-y-4">
                                {order.status_history.map((entry) => (
                                    <li key={entry.id} className="flex gap-3">
                                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-umber-600"></span>
                                        <div>
                                            <p className="text-sm font-semibold text-ink-950">{entry.to_status_label}</p>
                                            {entry.note ? <p className="text-sm text-ink-600">{entry.note}</p> : null}
                                            <p className="text-xs text-ink-400">{formatDate(entry.created_at)}</p>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        ) : (
                            <p className="mt-4 text-sm text-ink-500">No status history yet.</p>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="card-surface p-6">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">Customer</h2>
                        <p className="mt-3 font-semibold text-ink-950">{order.customer_name}</p>
                        <p className="text-sm text-ink-600">{order.customer_email}</p>
                        {order.customer_phone ? <p className="text-sm text-ink-600">{order.customer_phone}</p> : null}
                        {order.customer_note ? <p className="mt-3 rounded-lg bg-bone-50 p-3 text-sm text-ink-600">{order.customer_note}</p> : null}
                    </div>

                    <div className="card-surface p-6">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">Update status</h2>
                        <form className="mt-4 space-y-3" onSubmit={(e) => { e.preventDefault(); submitStatus(); }}>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-ink-700">New status</label>
                                <select
                                    value={statusForm.data.status}
                                    onChange={(e) => statusForm.setData('status', e.target.value)}
                                    className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                                >
                                    {allowedTransitions.map((option) => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                                {!allowedTransitions.length && <p className="mt-1 text-xs text-tan-700">No further transitions available.</p>}
                                {statusForm.errors.status && <p className="mt-1 text-xs text-ink-700">{statusForm.errors.status}</p>}
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-ink-700">Note <span className="text-ink-400">(optional)</span></label>
                                <textarea
                                    value={statusForm.data.note}
                                    onChange={(e) => statusForm.setData('note', e.target.value)}
                                    rows={2}
                                    className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                                ></textarea>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-ink-700">Carrier</label>
                                    <input
                                        value={statusForm.data.carrier}
                                        onChange={(e) => statusForm.setData('carrier', e.target.value)}
                                        type="text"
                                        className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-ink-700">Tracking #</label>
                                    <input
                                        value={statusForm.data.tracking_number}
                                        onChange={(e) => statusForm.setData('tracking_number', e.target.value)}
                                        type="text"
                                        className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                                    />
                                </div>
                            </div>
                            <button type="submit" disabled={statusForm.processing || !allowedTransitions.length} className="w-full btn btn-primary btn-sm">
                                Update status
                            </button>
                        </form>
                    </div>

                    <div className="card-surface p-6">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">Payment</h2>
                        <p className="mt-3 text-sm text-ink-600">{order.payment_method_label || '—'}</p>
                        <form className="mt-4 space-y-3" onSubmit={(e) => { e.preventDefault(); submitPayment(); }}>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-ink-700">Payment status</label>
                                <select
                                    value={paymentForm.data.payment_status}
                                    onChange={(e) => paymentForm.setData('payment_status', e.target.value)}
                                    className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="paid">Paid</option>
                                    <option value="failed">Failed</option>
                                    <option value="refunded">Refunded</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-ink-700">Reference</label>
                                <input
                                    value={paymentForm.data.payment_reference}
                                    onChange={(e) => paymentForm.setData('payment_reference', e.target.value)}
                                    type="text"
                                    className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                                />
                            </div>
                            <button type="submit" disabled={paymentForm.processing} className="w-full rounded-lg border border-bone-400 px-4 py-2 text-sm font-semibold text-ink-700 hover:bg-bone-50 disabled:bg-bone-100">
                                Update payment
                            </button>
                        </form>
                    </div>

                    {order.shipping_address ? (
                        <div className="card-surface p-6">
                            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">Shipping address</h2>
                            <address className="mt-3 text-sm not-italic leading-relaxed text-ink-600">
                                <span className="block font-semibold text-ink-950">{order.shipping_address.first_name} {order.shipping_address.last_name}</span>
                                <span className="block">{order.shipping_address.address_line_1}</span>
                                {order.shipping_address.address_line_2 ? <span className="block">{order.shipping_address.address_line_2}</span> : null}
                                <span className="block">{order.shipping_address.city} {order.shipping_address.postal_code}</span>
                                <span className="block">{order.shipping_address.country}</span>
                            </address>
                        </div>
                    ) : null}
                </div>
            </div>
        </AdminLayout>
    );
}
