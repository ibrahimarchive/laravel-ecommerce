import { Head, Link } from '@inertiajs/react';
import type { PageProps } from '../../types';
import StorefrontLayout from '../../Layouts/StorefrontLayout';

interface OrderItem {
    id: number;
    product_name: string;
    variant_name?: string | null;
    quantity: number;
    unit_price_formatted: string;
    total_formatted: string;
}

interface OrderTotalsFormatted {
    subtotal: string;
    discount_total: string;
    tax_total: string;
    shipping_total: string;
    grand_total: string;
}

interface Order {
    number: string;
    customer_name: string;
    customer_email: string;
    status_label: string;
    payment_status: string;
    payment_status_label: string;
    payment_method_label?: string | null;
    discount_total: number;
    items: OrderItem[];
    totals_formatted: OrderTotalsFormatted;
}

interface Props extends PageProps {
    order: Order;
}

export default function CheckoutSuccess({ order }: Props) {
    return (
        <StorefrontLayout>
            <Head title="Order confirmed" />

            <div className="container-page py-12 lg:py-16">
                <div className="mx-auto max-w-3xl">
                    <div className="card-surface p-8 text-center sm:p-10">
                        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-tan-400/25 text-umber-700">
                            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="m5 12.5 4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </span>

                        <p className="eyebrow mt-6">Order received</p>
                        <h1 className="title mt-2 text-3xl sm:text-4xl">Thank you for your <b>order</b></h1>
                        <p className="mt-4 text-sm text-ink-600">
                            A confirmation has been sent to
                            <span className="font-medium text-ink-900">{order.customer_email}</span>.
                        </p>

                        {order.payment_status === 'pending' && (
                            <p className="mx-auto mt-5 max-w-md rounded-lg border border-tan-300 bg-bone-100 px-4 py-3 text-xs text-umber-800">
                                Your payment is still pending. We will confirm your order as soon as it clears.
                            </p>
                        )}
                    </div>

                    <div className="card-surface mt-6 p-6 sm:p-8">
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-bone-200 pb-5">
                            <div>
                                <p className="eyebrow">Order number</p>
                                <p className="mt-1 font-display text-2xl text-ink-950">{order.number}</p>
                            </div>
                            <span className="badge badge-tan">{order.status_label}</span>
                        </div>

                        <dl className="grid gap-6 py-6 sm:grid-cols-2">
                            <div>
                                <dt className="eyebrow">Customer</dt>
                                <dd className="mt-2 space-y-1 text-sm text-ink-700">
                                    <p className="font-medium text-ink-950">{order.customer_name}</p>
                                    <p>{order.customer_email}</p>
                                </dd>
                            </div>
                            <div>
                                <dt className="eyebrow">Payment</dt>
                                <dd className="mt-2 space-y-1 text-sm text-ink-700">
                                    <p className="font-medium text-ink-950">{order.payment_method_label ?? 'Pending'}</p>
                                    <p>{order.payment_status_label}</p>
                                </dd>
                            </div>
                        </dl>

                        <ul className="divide-y divide-bone-200 border-y border-bone-200">
                            {order.items.map((item) => (
                                <li key={item.id} className="flex items-start justify-between gap-4 py-4">
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-ink-950">{item.product_name}</p>
                                        {item.variant_name && <p className="mt-0.5 text-xs text-ink-500">{item.variant_name}</p>}
                                        <p className="mt-1 text-xs text-ink-500">
                                            Qty {item.quantity} · {item.unit_price_formatted}
                                        </p>
                                    </div>
                                    <span className="shrink-0 font-display text-base text-ink-950">{item.total_formatted}</span>
                                </li>
                            ))}
                        </ul>

                        <dl className="mt-6 space-y-2.5 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-ink-500">Subtotal</dt>
                                <dd className="font-medium text-ink-900">{order.totals_formatted.subtotal}</dd>
                            </div>
                            {order.discount_total > 0 && (
                                <div className="flex justify-between">
                                    <dt className="text-umber-700">Discount</dt>
                                    <dd className="font-medium text-umber-700">−{order.totals_formatted.discount_total}</dd>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <dt className="text-ink-500">Tax</dt>
                                <dd className="font-medium text-ink-900">{order.totals_formatted.tax_total}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-ink-500">Shipping</dt>
                                <dd className="font-medium text-ink-900">{order.totals_formatted.shipping_total}</dd>
                            </div>
                            <div className="flex items-baseline justify-between border-t border-bone-300 pt-4">
                                <dt className="font-semibold text-ink-950">Total</dt>
                                <dd className="font-display text-2xl text-ink-950">{order.totals_formatted.grand_total}</dd>
                            </div>
                        </dl>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        <Link href="/account/orders" className="btn btn-primary">View my orders</Link>
                        <Link href="/shop" className="btn btn-outline">Continue shopping</Link>
                    </div>
                </div>
            </div>
        </StorefrontLayout>
    );
}
