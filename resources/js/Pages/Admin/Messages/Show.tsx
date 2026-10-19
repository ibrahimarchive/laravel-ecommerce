import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import type { PageProps } from '../../../types';

interface Message {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    subject: string;
    message: string;
    created_at: string;
    replied_at?: string | null;
}

interface Props extends PageProps {
    message: Message;
}

export default function MessagesShow({ message }: Props) {
    function markReplied(id: number) {
        router.patch(`/admin/messages/${id}/replied`, {}, { preserveScroll: true });
    }

    function destroy(id: number) {
        if (!confirm('Delete this message?')) return;
        router.delete(`/admin/messages/${id}`);
    }

    return (
        <AdminLayout>
            <Head title={message.subject} />

            <Link href="/admin/messages" className="text-sm font-medium text-ink-500 hover:text-ink-950">← Back to messages</Link>

            <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="title text-2xl">{message.subject}</h1>
                    <p className="mt-1 text-sm text-ink-500">
                        From <span className="font-medium text-ink-700">{message.name}</span>
                        &lt;{message.email}&gt;
                        {message.phone ? <span> · {message.phone}</span> : null}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-400">{new Date(message.created_at).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3">
                    {message.replied_at ? (
                        <span className="rounded-full bg-bone-100 px-3 py-1 text-xs font-semibold text-umber-800">Replied</span>
                    ) : null}
                    {!message.replied_at && (
                        <button
                            type="button"
                            className="rounded-lg border border-bone-400 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-bone-50"
                            onClick={() => markReplied(message.id)}
                        >
                            Mark as replied
                        </button>
                    )}
                    <button type="button" className="rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50" onClick={() => destroy(message.id)}>
                        Delete
                    </button>
                </div>
            </div>

            <div className="mt-6 card-surface p-6">
                <p className="whitespace-pre-line text-sm leading-relaxed text-ink-700">{message.message}</p>
            </div>

            <div className="mt-6">
                <a href={`mailto:${message.email}?subject=Re: ${encodeURIComponent(message.subject)}`} className="inline-flex btn btn-primary">
                    Reply by email
                </a>
            </div>
        </AdminLayout>
    );
}
