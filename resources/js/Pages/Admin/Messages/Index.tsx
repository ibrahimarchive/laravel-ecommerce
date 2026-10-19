import { useRef, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Pagination from '../../../Components/Pagination';
import type { PageProps, Paginated } from '../../../types';

interface Message {
    id: number;
    name: string;
    email: string;
    subject: string;
    created_at: string;
    is_read: boolean;
    replied_at?: string | null;
}

interface Props extends PageProps {
    messages: Paginated<Message>;
    filters: { q?: string; status?: string };
    stats: { unread: number; total: number };
}

export default function MessagesIndex({ messages, filters = {}, stats = { unread: 0, total: 0 } }: Props) {
    const [q, setQ] = useState(filters.q ?? '');
    const [status, setStatus] = useState(filters.status ?? 'unread');
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    function applyFilters(next: { q: string; status: string }) {
        router.get('/admin/messages', { ...next }, { preserveState: true, preserveScroll: true, replace: true });
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

    function destroy(message: Message) {
        if (!confirm('Delete this message?')) return;
        router.delete(`/admin/messages/${message.id}`, { preserveScroll: true });
    }

    return (
        <AdminLayout>
            <Head title="Messages" />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="title text-2xl">Messages</h1>
                    <p className="mt-1 text-sm text-ink-500">{stats.unread} unread · {stats.total} total</p>
                </div>
            </div>

            <div className="mt-6 flex flex-wrap items-end gap-3 card-surface p-4">
                <div className="flex-1 min-w-[200px]">
                    <label className="mb-1 block text-xs font-medium text-ink-500">Search</label>
                    <input
                        value={q}
                        onChange={(e) => onSearchChange(e.target.value)}
                        type="text"
                        placeholder="Name, email, or subject..."
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
                        <option value="unread">Unread</option>
                        <option value="read">Read</option>
                        <option value="replied">Replied</option>
                        <option value="">All</option>
                    </select>
                </div>
            </div>

            <div className="mt-6 overflow-hidden card-surface">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-bone-300 bg-bone-50 text-xs uppercase tracking-wide text-ink-500">
                        <tr>
                            <th className="px-4 py-3">From</th>
                            <th className="px-4 py-3">Subject</th>
                            <th className="px-4 py-3">Received</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-bone-100">
                        {messages.data.map((message) => (
                            <tr key={message.id} className={message.is_read ? 'hover:bg-bone-50' : 'bg-bone-100/40 hover:bg-bone-100'}>
                                <td className="px-4 py-3">
                                    <Link href={`/admin/messages/${message.id}`} className="font-semibold text-ink-950 hover:text-umber-700">{message.name}</Link>
                                    <p className="text-xs text-ink-400">{message.email}</p>
                                </td>
                                <td className="px-4 py-3 text-ink-700">{message.subject}</td>
                                <td className="px-4 py-3 text-ink-500">{new Date(message.created_at).toLocaleDateString()}</td>
                                <td className="px-4 py-3">
                                    {message.replied_at ? (
                                        <span className="rounded-full bg-bone-100 px-2.5 py-1 text-xs font-semibold text-umber-800">Replied</span>
                                    ) : !message.is_read ? (
                                        <span className="rounded-full bg-bone-100 px-2.5 py-1 text-xs font-semibold text-tan-800">Unread</span>
                                    ) : (
                                        <span className="rounded-full bg-bone-100 px-2.5 py-1 text-xs font-semibold text-ink-600">Read</span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-end gap-3">
                                        <Link href={`/admin/messages/${message.id}`} className="text-sm font-semibold text-umber-700 hover:text-umber-600">View</Link>
                                        <button type="button" className="text-sm font-semibold text-ink-700 hover:text-ink-600" onClick={() => destroy(message)}>Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {!messages.data.length && (
                            <tr>
                                <td colSpan={5} className="px-4 py-10 text-center text-sm text-ink-500">No messages found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-6">
                <Pagination links={messages.meta?.links ?? []} />
            </div>
        </AdminLayout>
    );
}
