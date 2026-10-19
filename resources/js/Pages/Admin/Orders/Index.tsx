import { useRef, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Pagination from '../../../Components/Pagination';
import type { PageProps, Paginated } from '../../../types';

interface Order {
    id: number;
    number: string;
    customer_name: string;
    customer_email: string;
    placed_at: string;
    status_label: string;
    payment_status_label: string;
    totals_formatted: { grand_total: string };
}

interface StatusOption {
    value: string;
    label: string;
}

type OrderPaginator = Paginated<Order> & { meta: NonNullable<Paginated<Order>['meta']> };

interface Props extends PageProps {
    orders: OrderPaginator;
    filters: { q?: string; status?: string; payment_status?: string };
    statuses: StatusOption[];
    paymentStatuses: StatusOption[];
}

export default function OrdersIndex({ orders, filters = {}, statuses = [], paymentStatuses = [] }: Props) {
    const [q, setQ] = useState(filters.q ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [paymentStatus, setPaymentStatus] = useState(filters.payment_status ?? '');
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const apply = (next: { q: string; status: string; paymentStatus: string }) => {
        router.get(
            '/admin/orders',
            {
                q: next.q || undefined,
                status: next.status || undefined,
                payment_status: next.paymentStatus || undefined,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const onSearchChange = (value: string) => {
        setQ(value);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => apply({ q: value, status, paymentStatus }), 350);
    };

    const onStatusChange = (value: string) => {
        setStatus(value);
        apply({ q, status: value, paymentStatus });
    };

    const onPaymentStatusChange = (value: string) => {
        setPaymentStatus(value);
        apply({ q, status, paymentStatus: value });
    };

    const reset = () => {
        setQ('');
        setStatus('');
        setPaymentStatus('');
    };

    return (
        <AdminLayout>
            <Head title="Orders" />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="title text-2xl">Orders</h1>
                    <p className="mt-1 text-sm text-ink-500">{orders.meta.total} orders total</p>
                </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 card-surface p-4">
                <input
                    value={q}
                    onChange={(e) => onSearchChange(e.target.value)}
                    type="search"
                    placeholder="Search order number, name, email..."
                    className="w-full max-w-xs rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                />
                <select
                    value={status}
                    onChange={(e) => onStatusChange(e.target.value)}
                    className="rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                >
                    <option value="">All statuses</option>
                    {statuses.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
                <select
                    value={paymentStatus}
                    onChange={(e) => onPaymentStatusChange(e.target.value)}
                    className="rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                >
                    <option value="">All payments</option>
                    {paymentStatuses.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
                <button type="button" onClick={reset} className="text-sm font-semibold text-ink-600 hover:text-ink-950">Clear</button>
            </div>

            <div className="mt-4 overflow-hidden card-surface">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-bone-300 bg-bone-50 text-xs uppercase tracking-wide text-ink-500">
                            <tr>
                                <th className="px-4 py-3">Order</th>
                                <th className="px-4 py-3">Customer</th>
                                <th className="px-4 py-3">Placed</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Payment</th>
                                <th className="px-4 py-3 text-right">Total</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-bone-100">
                            {orders.data.map((order) => (
                                <tr key={order.id} className="hover:bg-bone-50">
                                    <td className="px-4 py-3 font-semibold text-ink-950">{order.number}</td>
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-ink-800">{order.customer_name}</p>
                                        <p className="text-xs text-ink-500">{order.customer_email}</p>
                                    </td>
                                    <td className="px-4 py-3 text-ink-600">{new Date(order.placed_at).toLocaleDateString()}</td>
                                    <td className="px-4 py-3">
                                        <span className="rounded-full bg-bone-100 px-2.5 py-1 text-xs font-semibold text-ink-700">{order.status_label}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="rounded-full bg-bone-100 px-2.5 py-1 text-xs font-semibold text-ink-700">{order.payment_status_label}</span>
                                    </td>
                                    <td className="px-4 py-3 text-right font-semibold text-ink-950">{order.totals_formatted.grand_total}</td>
                                    <td className="px-4 py-3 text-right">
                                        <Link href={`/admin/orders/${order.number}`} className="font-semibold text-umber-700 hover:underline">View</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {!orders.data.length && (
                    <p className="px-6 py-12 text-center text-sm text-ink-500">No orders match your filters.</p>
                )}
            </div>

            <div className="mt-6">
                <Pagination links={orders.meta.links} />
            </div>
        </AdminLayout>
    );
}
