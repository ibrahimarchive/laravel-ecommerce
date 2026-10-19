import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';

interface SalesPoint {
    date: string;
    total: number | string;
}

interface RecentOrder {
    id: number;
    number: string;
    placed_at: string;
    customer_name: string;
    status_label: string;
    totals_formatted: { grand_total: string };
}

interface TopProduct {
    name: string;
    quantity: number;
    revenue_formatted: string;
}

interface LowStockProduct {
    id: number;
    name: string;
    stock_quantity: number;
}

interface DashboardStats {
    revenue_total_formatted?: string;
    revenue_month_formatted?: string;
    orders_count?: number;
    orders_pending?: number;
    products_count?: number;
    low_stock_count?: number;
    customers_count?: number;
    reviews_pending?: number;
    messages_unread?: number;
}

interface Props {
    stats?: DashboardStats;
    recentOrders?: RecentOrder[];
    lowStockProducts?: LowStockProduct[];
    topProducts?: TopProduct[];
    salesChart?: SalesPoint[];
}

export default function AdminDashboard({
    stats = {},
    recentOrders = [],
    lowStockProducts = [],
    topProducts = [],
    salesChart = [],
}: Props) {
    const cards = [
        { label: 'Total revenue', value: stats.revenue_total_formatted ?? '$0.00', sub: `${stats.revenue_month_formatted ?? '$0.00'} this month`, href: '/admin/orders' },
        { label: 'Orders', value: stats.orders_count ?? 0, sub: `${stats.orders_pending ?? 0} pending`, href: '/admin/orders' },
        { label: 'Products', value: stats.products_count ?? 0, sub: `${stats.low_stock_count ?? 0} low stock`, href: '/admin/products' },
        { label: 'Customers', value: stats.customers_count ?? 0, sub: `${stats.reviews_pending ?? 0} reviews pending`, href: '/admin/customers' },
    ];

    const maxSale = Math.max(1, ...salesChart.map((point) => Number(point.total)));

    const barHeight = (total: number | string) => `${Math.round((Number(total) / maxSale) * 100)}%`;

    return (
        <AdminLayout>
            <Head title="Admin dashboard" />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="title text-2xl">Dashboard</h1>
                    <p className="mt-1 text-sm text-ink-500">Store overview and recent activity.</p>
                </div>
                {stats.messages_unread && (
                    <Link href="/admin/messages" className="rounded-lg border border-tan-300 bg-bone-100 px-4 py-2 text-sm font-semibold text-tan-900">
                        {stats.messages_unread} unread message{stats.messages_unread === 1 ? '' : 's'}
                    </Link>
                )}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {cards.map((card) => (
                    <Link key={card.label} href={card.href} className="card-surface p-5 transition hover:border-tan-300 hover:shadow-sm">
                        <p className="text-sm font-medium text-ink-500">{card.label}</p>
                        <p className="mt-2 text-3xl font-bold text-ink-950">{card.value}</p>
                        <p className="mt-1 text-xs text-ink-400">{card.sub}</p>
                    </Link>
                ))}
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <div className="card-surface p-6 lg:col-span-2">
                    <h2 className="text-lg font-semibold text-ink-950">Sales — last 14 days</h2>
                    <div className="mt-6 flex h-48 items-end gap-1.5">
                        {salesChart.map((point) => (
                            <div key={point.date} className="group flex flex-1 flex-col items-center justify-end" title={`${point.date}: $${Number(point.total).toFixed(2)}`}>
                                <div className="w-full rounded-t bg-umber-600 transition group-hover:bg-umber-700" style={{ height: barHeight(point.total) }}></div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-ink-400">
                        <span>{salesChart[0]?.date}</span>
                        <span>{salesChart[salesChart.length - 1]?.date}</span>
                    </div>
                </div>

                <div className="card-surface p-6">
                    <h2 className="text-lg font-semibold text-ink-950">Top products</h2>
                    {topProducts.length ? (
                        <ul className="mt-4 space-y-3">
                            {topProducts.map((product, index) => (
                                <li key={index} className="flex items-center justify-between text-sm">
                                    <span className="truncate pr-3 text-ink-700">{product.name}</span>
                                    <span className="shrink-0 font-semibold text-ink-950">{product.quantity} · {product.revenue_formatted}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="mt-4 text-sm text-ink-500">No sales yet.</p>
                    )}
                </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <div className="card-surface lg:col-span-2">
                    <div className="flex items-center justify-between border-b border-bone-300 px-6 py-4">
                        <h2 className="text-lg font-semibold text-ink-950">Recent orders</h2>
                        <Link href="/admin/orders" className="text-sm font-semibold text-umber-700 hover:text-umber-600">View all →</Link>
                    </div>
                    {recentOrders.length ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-bone-50 text-xs uppercase tracking-wide text-ink-500">
                                    <tr>
                                        <th className="px-6 py-3">Order</th>
                                        <th className="px-6 py-3">Customer</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-bone-100">
                                    {recentOrders.map((order) => (
                                        <tr key={order.id}>
                                            <td className="px-6 py-3">
                                                <Link href={`/admin/orders/${order.number}`} className="font-semibold text-umber-700 hover:underline">{order.number}</Link>
                                                <p className="text-xs text-ink-400">{new Date(order.placed_at).toLocaleDateString()}</p>
                                            </td>
                                            <td className="px-6 py-3 text-ink-600">{order.customer_name}</td>
                                            <td className="px-6 py-3">
                                                <span className="rounded-full bg-bone-100 px-2.5 py-1 text-xs font-semibold text-ink-700">{order.status_label}</span>
                                            </td>
                                            <td className="px-6 py-3 text-right font-semibold text-ink-950">{order.totals_formatted.grand_total}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="px-6 py-10 text-center text-sm text-ink-500">No orders yet.</p>
                    )}
                </div>

                <div className="card-surface p-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-ink-950">Low stock</h2>
                        <Link href="/admin/products?status=low_stock" className="text-sm font-semibold text-umber-700 hover:text-umber-600">Manage</Link>
                    </div>
                    {lowStockProducts.length ? (
                        <ul className="mt-4 space-y-3">
                            {lowStockProducts.map((product) => (
                                <li key={product.id} className="flex items-center justify-between text-sm">
                                    <span className="truncate pr-3 text-ink-700">{product.name}</span>
                                    <span className="shrink-0 rounded-full bg-ink-50 px-2 py-0.5 text-xs font-semibold text-ink-800">{product.stock_quantity} left</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="mt-4 text-sm text-ink-500">All products are well stocked.</p>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
