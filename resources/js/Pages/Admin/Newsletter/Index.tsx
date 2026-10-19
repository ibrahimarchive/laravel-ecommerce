import { useRef, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Pagination from '../../../Components/Pagination';
import type { PageProps, Paginated } from '../../../types';

interface Subscriber {
    id: number;
    email: string;
    name?: string | null;
    subscribed_at?: string | null;
    is_active: boolean;
}

interface Props extends PageProps {
    subscribers: Paginated<Subscriber>;
    filters: { q?: string; status?: string };
    stats: { active: number; inactive: number };
}

export default function NewsletterIndex({ subscribers, filters = {}, stats = { active: 0, inactive: 0 } }: Props) {
    const [q, setQ] = useState(filters.q ?? '');
    const [status, setStatus] = useState(filters.status ?? 'active');
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    function applyFilters(next: { q: string; status: string }) {
        router.get('/admin/newsletter', { ...next }, { preserveState: true, preserveScroll: true, replace: true });
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

    function destroy(subscriber: Subscriber) {
        if (!confirm(`Remove ${subscriber.email} from the newsletter?`)) return;
        router.delete(`/admin/newsletter/${subscriber.id}`, { preserveScroll: true });
    }

    return (
        <AdminLayout>
            <Head title="Newsletter" />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="title text-2xl">Newsletter</h1>
                    <p className="mt-1 text-sm text-ink-500">{stats.active} active · {stats.inactive} unsubscribed</p>
                </div>
            </div>

            <div className="mt-6 flex flex-wrap items-end gap-3 card-surface p-4">
                <div className="flex-1 min-w-[200px]">
                    <label className="mb-1 block text-xs font-medium text-ink-500">Search</label>
                    <input
                        value={q}
                        onChange={(e) => onSearchChange(e.target.value)}
                        type="text"
                        placeholder="Email or name..."
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
                        <option value="active">Active</option>
                        <option value="inactive">Unsubscribed</option>
                        <option value="">All</option>
                    </select>
                </div>
            </div>

            <div className="mt-6 overflow-hidden card-surface">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-bone-300 bg-bone-50 text-xs uppercase tracking-wide text-ink-500">
                        <tr>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Subscribed</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-bone-100">
                        {subscribers.data.map((subscriber) => (
                            <tr key={subscriber.id} className="hover:bg-bone-50">
                                <td className="px-4 py-3 font-medium text-ink-950">{subscriber.email}</td>
                                <td className="px-4 py-3 text-ink-600">{subscriber.name || '—'}</td>
                                <td className="px-4 py-3 text-ink-500">
                                    {subscriber.subscribed_at ? new Date(subscriber.subscribed_at).toLocaleDateString() : '—'}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${subscriber.is_active ? 'bg-bone-100 text-umber-800' : 'bg-bone-100 text-ink-600'}`}>
                                        {subscriber.is_active ? 'Active' : 'Unsubscribed'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <button type="button" className="text-sm font-semibold text-ink-700 hover:text-ink-600" onClick={() => destroy(subscriber)}>Remove</button>
                                </td>
                            </tr>
                        ))}
                        {!subscribers.data.length && (
                            <tr>
                                <td colSpan={5} className="px-4 py-10 text-center text-sm text-ink-500">No subscribers found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-6">
                <Pagination links={subscribers.meta?.links ?? []} />
            </div>
        </AdminLayout>
    );
}
