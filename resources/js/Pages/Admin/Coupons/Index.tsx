import { useRef, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

interface CouponItem {
    id: number;
    code: string;
    name?: string | null;
    value_label: string;
    min_order_total: number | null;
    used_count: number;
    usage_limit?: number | null;
    orders_count: number;
    starts_at?: string | null;
    expires_at?: string | null;
    is_redeemable?: boolean;
    is_active?: boolean;
}

interface Props {
    coupons?: CouponItem[];
    filters?: { q?: string; status?: string };
}

export default function CouponsIndex({ coupons = [], filters: initialFilters = {} }: Props) {
    const [q, setQ] = useState(initialFilters.q ?? '');
    const [status, setStatus] = useState(initialFilters.status ?? '');

    const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    function applyFilters(values: { q: string; status: string }) {
        router.get('/admin/coupons', { ...values }, { preserveState: true, preserveScroll: true, replace: true });
    }

    function clearFilters() {
        setQ('');
        setStatus('');
        applyFilters({ q: '', status: '' });
    }

    const [deleting, setDeleting] = useState<number | null>(null);

    function destroy(coupon: CouponItem) {
        if (!confirm(`Delete coupon "${coupon.code}"?`)) {
            return;
        }

        setDeleting(coupon.id);
        router.delete(`/admin/coupons/${coupon.id}`, { onFinish: () => setDeleting(null) });
    }

    return (
        <AdminLayout>
            <Head title="Coupons" />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="title text-2xl">Coupons</h1>
                    <p className="mt-1 text-sm text-ink-500">{coupons.length} coupons</p>
                </div>
                <Link href="/admin/coupons/create" className="btn btn-primary btn-sm">
                    New coupon
                </Link>
            </div>

            <div className="mt-6 flex flex-wrap items-end gap-3 card-surface p-4">
                <div className="flex-1 min-w-[200px]">
                    <label className="mb-1 block text-xs font-medium text-ink-500">Search</label>
                    <input
                        type="text"
                        placeholder="Coupon code..."
                        className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                        value={q}
                        onChange={(e) => {
                            const value = e.target.value;
                            setQ(value);
                            clearTimeout(timeout.current);
                            timeout.current = setTimeout(() => applyFilters({ q: value, status }), 350);
                        }}
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-medium text-ink-500">Status</label>
                    <select
                        className="rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                        value={status}
                        onChange={(e) => {
                            const value = e.target.value;
                            setStatus(value);
                            applyFilters({ q, status: value });
                        }}
                    >
                        <option value="">All</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
                <button type="button" className="rounded-lg border border-bone-400 px-4 py-2 text-sm font-medium text-ink-600 hover:bg-bone-50" onClick={clearFilters}>
                    Clear
                </button>
            </div>

            <div className="mt-6 overflow-hidden card-surface">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-bone-300 bg-bone-50 text-xs uppercase tracking-wide text-ink-500">
                        <tr>
                            <th className="px-4 py-3">Code</th>
                            <th className="px-4 py-3">Discount</th>
                            <th className="px-4 py-3">Min order</th>
                            <th className="px-4 py-3">Usage</th>
                            <th className="px-4 py-3">Window</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-bone-100">
                        {coupons.map((coupon) => (
                            <tr key={coupon.id} className="hover:bg-bone-50">
                                <td className="px-4 py-3">
                                    <p className="font-mono font-semibold text-ink-950">{coupon.code}</p>
                                    <p className="text-xs text-ink-400">{coupon.name || '—'}</p>
                                </td>
                                <td className="px-4 py-3 text-ink-600">{coupon.value_label}</td>
                                <td className="px-4 py-3 text-ink-600">{coupon.min_order_total !== null ? coupon.min_order_total : '—'}</td>
                                <td className="px-4 py-3 text-ink-600">
                                    {coupon.used_count}{coupon.usage_limit && <span> / {coupon.usage_limit}</span>}
                                    <span className="block text-xs text-ink-400">{coupon.orders_count} orders</span>
                                </td>
                                <td className="px-4 py-3 text-xs text-ink-500">
                                    <span className="block">From: {coupon.starts_at || '—'}</span>
                                    <span className="block">To: {coupon.expires_at || '—'}</span>
                                </td>
                                <td className="px-4 py-3">
                                    {coupon.is_redeemable ? (
                                        <span className="rounded-full bg-bone-100 px-2.5 py-1 text-xs font-semibold text-umber-800">Redeemable</span>
                                    ) : (
                                        <span className="rounded-full bg-bone-100 px-2.5 py-1 text-xs font-semibold text-ink-600">{coupon.is_active ? 'Not redeemable' : 'Inactive'}</span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-end gap-3">
                                        <Link href={`/admin/coupons/${coupon.id}/edit`} className="text-sm font-semibold text-umber-700 hover:text-umber-600">Edit</Link>
                                        <button type="button" disabled={deleting === coupon.id} className="text-sm font-semibold text-ink-700 hover:text-ink-600 disabled:text-bone-400" onClick={() => destroy(coupon)}>
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {!coupons.length && (
                            <tr>
                                <td colSpan={7} className="px-4 py-10 text-center text-sm text-ink-500">No coupons found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
