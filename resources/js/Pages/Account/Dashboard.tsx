import { Head, Link } from '@inertiajs/react';
import AccountLayout from '../../Layouts/AccountLayout';

interface DashboardStats {
    orders_count?: number;
    open_orders?: number;
    wishlist_count?: number;
    addresses_count?: number;
}

interface RecentOrder {
    id: number;
    number: string;
    placed_at: string;
    status_label: string;
    totals_formatted: { grand_total: string };
}

interface Props {
    stats?: DashboardStats;
    recentOrders?: RecentOrder[];
}

export default function Dashboard({ stats = {}, recentOrders = [] }: Props) {
    const cards = (stats: DashboardStats) => [
        { label: 'Total orders', value: stats.orders_count ?? 0, href: '/account/orders' },
        { label: 'Open orders', value: stats.open_orders ?? 0, href: '/account/orders' },
        { label: 'Wishlist items', value: stats.wishlist_count ?? 0, href: '/account/wishlist' },
        { label: 'Saved addresses', value: stats.addresses_count ?? 0, href: '/account/addresses' },
    ];

    return (
        <AccountLayout>
            <Head title="My account" />

            <h1 className="title text-2xl">Dashboard</h1>
            <p className="mt-1 text-sm text-ink-500">Welcome back. Here's a summary of your account.</p>

            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                {cards(stats).map((card) => (
                    <Link
                        key={card.label}
                        href={card.href}
                        className="card-surface p-5 transition hover:border-tan-300 hover:shadow-sm"
                    >
                        <p className="text-3xl font-bold text-ink-950">{card.value}</p>
                        <p className="mt-1 text-sm text-ink-500">{card.label}</p>
                    </Link>
                ))}
            </div>

            <div className="mt-10">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-ink-950">Recent orders</h2>
                    <Link href="/account/orders" className="text-sm font-semibold text-umber-700 hover:text-umber-600">View all →</Link>
                </div>

                {recentOrders.length ? (
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
                                {recentOrders.map((order) => (
                                    <tr key={order.id}>
                                        <td className="px-4 py-3">
                                            <Link href={`/account/orders/${order.number}`} className="font-semibold text-umber-700 hover:underline">
                                                {order.number}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 text-ink-600">{new Date(order.placed_at).toLocaleDateString()}</td>
                                        <td className="px-4 py-3">
                                            <span className="rounded-full bg-bone-100 px-2.5 py-1 text-xs font-semibold text-ink-700">{order.status_label}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold text-ink-950">{order.totals_formatted.grand_total}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="mt-4 rounded-xl border border-dashed border-bone-400 bg-canvas-deep px-5 py-10 text-center text-sm text-ink-500">
                        You haven't placed any orders yet.
                    </p>
                )}
            </div>
        </AccountLayout>
    );
}
