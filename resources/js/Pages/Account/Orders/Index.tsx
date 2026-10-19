import { Head, Link } from '@inertiajs/react';
import AccountLayout from '../../../Layouts/AccountLayout';
import Pagination from '../../../Components/Pagination';
import type { Paginated, PaginationLink } from '../../../types';

interface Order {
    id: number;
    number: string;
    placed_at: string;
    items_count: number;
    status_label: string;
    payment_status_label: string;
    totals_formatted: { grand_total: string };
}

interface Props {
    orders: Paginated<Order> & { meta: { links: PaginationLink[] } };
}

export default function OrdersIndex({ orders }: Props) {
    return (
        <AccountLayout>
            <Head title="My orders" />

            <div className="flex items-center justify-between">
                <h1 className="title text-2xl">Orders</h1>
                <Link href="/shop" className="text-sm font-semibold text-umber-700 hover:text-umber-600">Continue shopping →</Link>
            </div>

            {orders.data.length ? (
                <div className="mt-6 overflow-hidden card-surface">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-bone-300 bg-bone-50 text-xs uppercase tracking-wide text-ink-500">
                            <tr>
                                <th className="px-4 py-3">Order</th>
                                <th className="px-4 py-3">Placed</th>
                                <th className="px-4 py-3">Items</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Payment</th>
                                <th className="px-4 py-3 text-right">Total</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-bone-100">
                            {orders.data.map((order) => (
                                <tr key={order.id}>
                                    <td className="px-4 py-3 font-semibold text-ink-950">{order.number}</td>
                                    <td className="px-4 py-3 text-ink-600">{new Date(order.placed_at).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 text-ink-600">{order.items_count}</td>
                                    <td className="px-4 py-3">
                                        <span className="rounded-full bg-bone-100 px-2.5 py-1 text-xs font-semibold text-ink-700">{order.status_label}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="rounded-full bg-bone-100 px-2.5 py-1 text-xs font-semibold text-ink-700">{order.payment_status_label}</span>
                                    </td>
                                    <td className="px-4 py-3 text-right font-semibold text-ink-950">{order.totals_formatted.grand_total}</td>
                                    <td className="px-4 py-3 text-right">
                                        <Link href={`/account/orders/${order.number}`} className="font-semibold text-umber-700 hover:underline">View</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="mt-6 rounded-xl border border-dashed border-bone-400 bg-canvas-deep px-5 py-12 text-center text-sm text-ink-500">
                    You haven't placed any orders yet.
                </p>
            )}

            <div className="mt-6">
                <Pagination links={orders.meta.links} />
            </div>
        </AccountLayout>
    );
}
