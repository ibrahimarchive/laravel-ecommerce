import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import type { PageProps } from '../../../types';

interface Address {
    id: number;
    label?: string | null;
    one_liner: string;
    phone?: string | null;
}

interface CustomerOrder {
    id: number;
    number: string;
    placed_at: string;
    status_label: string;
    totals_formatted: { grand_total: string };
}

interface Customer {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    created_at: string;
    is_active: boolean;
    addresses: Address[];
}

interface Stats {
    orders_count: number;
    total_spent: number;
    reviews_count: number;
}

interface Props extends PageProps {
    customer: Customer;
    orders: CustomerOrder[];
    stats: Stats;
}

export default function CustomersShow({ customer, orders = [], stats = { orders_count: 0, total_spent: 0, reviews_count: 0 } }: Props) {
    const { store } = usePage<PageProps>().props;

    function money(value: number) {
        const currency = store?.currency ?? { symbol: '$', position: 'before', decimals: 2 };
        const formatted = Number(value).toFixed(currency.decimals);
        return currency.position === 'before' ? `${currency.symbol}${formatted}` : `${formatted}${currency.symbol}`;
    }

    return (
        <AdminLayout>
            <Head title={customer.name} />

            <Link href="/admin/customers" className="text-sm font-medium text-ink-500 hover:text-ink-950">← Back to customers</Link>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="title text-2xl">{customer.name}</h1>
                    <p className="mt-1 text-sm text-ink-500">
                        {customer.email}
                        {customer.phone ? <span> · {customer.phone}</span> : null}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${customer.is_active ? 'bg-bone-100 text-umber-800' : 'bg-bone-100 text-ink-600'}`}>
                        {customer.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <button
                        type="button"
                        className="rounded-lg border border-bone-400 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-bone-50"
                        onClick={() => router.patch(`/admin/customers/${customer.id}/toggle`, {}, { preserveScroll: true })}
                    >
                        {customer.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div className="card-surface p-5">
                    <p className="text-3xl font-bold text-ink-950">{stats.orders_count}</p>
                    <p className="mt-1 text-sm text-ink-500">Orders</p>
                </div>
                <div className="card-surface p-5">
                    <p className="text-3xl font-bold text-ink-950">{money(stats.total_spent)}</p>
                    <p className="mt-1 text-sm text-ink-500">Total spent</p>
                </div>
                <div className="card-surface p-5">
                    <p className="text-3xl font-bold text-ink-950">{stats.reviews_count}</p>
                    <p className="mt-1 text-sm text-ink-500">Reviews</p>
                </div>
                <div className="card-surface p-5">
                    <p className="text-sm font-semibold text-ink-950">{customer.created_at}</p>
                    <p className="mt-1 text-sm text-ink-500">Customer since</p>
                </div>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <h2 className="text-lg font-semibold text-ink-950">Orders</h2>
                    <div className="mt-4 overflow-hidden card-surface">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-bone-300 bg-bone-50 text-xs uppercase tracking-wide text-ink-500">
                                <tr>
                                    <th className="px-4 py-3">Order</th>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-bone-100">
                                {orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-bone-50">
                                        <td className="px-4 py-3">
                                            <Link href={`/admin/orders/${order.number}`} className="font-semibold text-umber-700 hover:underline">{order.number}</Link>
                                        </td>
                                        <td className="px-4 py-3 text-ink-600">{new Date(order.placed_at).toLocaleDateString()}</td>
                                        <td className="px-4 py-3">
                                            <span className="rounded-full bg-bone-100 px-2.5 py-1 text-xs font-semibold text-ink-700">{order.status_label}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold text-ink-950">{order.totals_formatted.grand_total}</td>
                                    </tr>
                                ))}
                                {!orders.length && (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-10 text-center text-sm text-ink-500">No orders yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div>
                    <h2 className="text-lg font-semibold text-ink-950">Addresses</h2>
                    <div className="mt-4 space-y-3">
                        {customer.addresses.map((address) => (
                            <div key={address.id} className="card-surface p-4">
                                <p className="text-sm font-semibold text-ink-950">{address.label || 'Address'}</p>
                                <p className="mt-1 text-sm text-ink-500">{address.one_liner}</p>
                                {address.phone ? <p className="mt-1 text-xs text-ink-400">{address.phone}</p> : null}
                            </div>
                        ))}
                        {!customer.addresses.length && (
                            <p className="rounded-xl border border-dashed border-bone-400 bg-canvas-deep px-4 py-8 text-center text-sm text-ink-500">
                                No addresses saved.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
