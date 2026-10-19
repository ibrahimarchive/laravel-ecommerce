import { useRef, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Pagination from '../../../Components/Pagination';
import type { PageProps, Paginated } from '../../../types';

interface Address {
    id: number;
    label?: string | null;
    one_liner: string;
    phone?: string | null;
}

interface Customer {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    orders_count: number;
    reviews_count: number;
    created_at: string;
    is_active: boolean;
    addresses: Address[];
}

interface Props extends PageProps {
    customers: Paginated<Customer>;
    filters: { q?: string; status?: string };
}

export default function CustomersIndex({ customers, filters = {} }: Props) {
    const [q, setQ] = useState(filters.q ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    function applyFilters(next: { q: string; status: string }) {
        router.get('/admin/customers', { ...next }, { preserveState: true, preserveScroll: true, replace: true });
    }

    function onSearchChange(value: string) {
        setQ(value);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => applyFilters({ q: value, status }), 350);
    }

    function onStatusChange(value: string) {
        setStatus(value);
        applyFilters({ q, status: value });
    }

    function clearFilters() {
        setQ('');
        setStatus('');
        applyFilters({ q: '', status: '' });
    }

    function toggle(customer: Customer) {
        router.patch(`/admin/customers/${customer.id}/toggle`, {}, { preserveScroll: true });
    }

    return (
        <AdminLayout>
            <Head title="Customers" />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="title text-2xl">Customers</h1>
                    <p className="mt-1 text-sm text-ink-500">{customers.meta?.total ?? customers.data.length} customers</p>
                </div>
            </div>

            <div className="mt-6 flex flex-wrap items-end gap-3 card-surface p-4">
                <div className="flex-1 min-w-[200px]">
                    <label className="mb-1 block text-xs font-medium text-ink-500">Search</label>
                    <input
                        value={q}
                        onChange={(e) => onSearchChange(e.target.value)}
                        type="text"
                        placeholder="Name or email..."
                        className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-medium text-ink-500">Status</label>
                    <select
                        value={status}
                        onChange={(e) => onStatusChange(e.target.value)}
                        className="rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
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
                            <th className="px-4 py-3">Customer</th>
                            <th className="px-4 py-3">Phone</th>
                            <th className="px-4 py-3">Orders</th>
                            <th className="px-4 py-3">Reviews</th>
                            <th className="px-4 py-3">Joined</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-bone-100">
                        {customers.data.map((customer) => (
                            <tr key={customer.id} className="hover:bg-bone-50">
                                <td className="px-4 py-3">
                                    <Link href={`/admin/customers/${customer.id}`} className="font-semibold text-ink-950 hover:text-umber-700">{customer.name}</Link>
                                    <p className="text-xs text-ink-400">{customer.email}</p>
                                </td>
                                <td className="px-4 py-3 text-ink-600">{customer.phone || '—'}</td>
                                <td className="px-4 py-3 text-ink-600">{customer.orders_count}</td>
                                <td className="px-4 py-3 text-ink-600">{customer.reviews_count}</td>
                                <td className="px-4 py-3 text-ink-500">{new Date(customer.created_at).toLocaleDateString()}</td>
                                <td className="px-4 py-3">
                                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${customer.is_active ? 'bg-bone-100 text-umber-800' : 'bg-bone-100 text-ink-600'}`}>
                                        {customer.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-end gap-3">
                                        <Link href={`/admin/customers/${customer.id}`} className="text-sm font-semibold text-umber-700 hover:text-umber-600">View</Link>
                                        <button type="button" className="text-sm font-semibold text-ink-600 hover:text-ink-950" onClick={() => toggle(customer)}>
                                            {customer.is_active ? 'Deactivate' : 'Activate'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {!customers.data.length && (
                            <tr>
                                <td colSpan={7} className="px-4 py-10 text-center text-sm text-ink-500">No customers found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-6">
                <Pagination links={customers.meta?.links ?? []} />
            </div>
        </AdminLayout>
    );
}
