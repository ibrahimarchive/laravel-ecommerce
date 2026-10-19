import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import type { PageProps } from '../../../types';

interface Page {
    id: number;
    title: string;
    slug: string;
    sort_order: number;
    updated_at: string;
    is_published: boolean;
    show_in_footer: boolean;
}

interface Props extends PageProps {
    pages: Page[];
}

export default function PagesIndex({ pages = [] }: Props) {
    const [deleting, setDeleting] = useState<number | null>(null);

    function destroy(page: Page) {
        if (!confirm(`Delete page "${page.title}"?`)) return;
        setDeleting(page.id);
        router.delete(`/admin/pages/${page.id}`, { onFinish: () => setDeleting(null) });
    }

    return (
        <AdminLayout>
            <Head title="Pages" />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="title text-2xl">Pages</h1>
                    <p className="mt-1 text-sm text-ink-500">Static content pages such as About, Terms, and FAQs.</p>
                </div>
                <Link href="/admin/pages/create" className="btn btn-primary btn-sm">
                    New page
                </Link>
            </div>

            <div className="mt-6 overflow-hidden card-surface">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-bone-300 bg-bone-50 text-xs uppercase tracking-wide text-ink-500">
                        <tr>
                            <th className="px-4 py-3">Title</th>
                            <th className="px-4 py-3">Slug</th>
                            <th className="px-4 py-3">Order</th>
                            <th className="px-4 py-3">Updated</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-bone-100">
                        {pages.map((page) => (
                            <tr key={page.id} className="hover:bg-bone-50">
                                <td className="px-4 py-3 font-semibold text-ink-950">{page.title}</td>
                                <td className="px-4 py-3 text-ink-600">
                                    <Link href={`/page/${page.slug}`} className="text-umber-700 hover:underline">{page.slug}</Link>
                                </td>
                                <td className="px-4 py-3 text-ink-600">{page.sort_order}</td>
                                <td className="px-4 py-3 text-ink-500">{page.updated_at}</td>
                                <td className="px-4 py-3">
                                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${page.is_published ? 'bg-bone-100 text-umber-800' : 'bg-bone-100 text-ink-600'}`}>
                                        {page.is_published ? 'Published' : 'Draft'}
                                    </span>
                                    {page.show_in_footer ? <span className="ml-1 rounded-full bg-bone-100 px-2.5 py-1 text-xs font-semibold text-ink-900">Footer</span> : null}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-end gap-3">
                                        <Link href={`/admin/pages/${page.id}/edit`} className="text-sm font-semibold text-umber-700 hover:text-umber-600">Edit</Link>
                                        <button type="button" disabled={deleting === page.id} className="text-sm font-semibold text-ink-700 hover:text-ink-600 disabled:text-bone-400" onClick={() => destroy(page)}>
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {!pages.length && (
                            <tr>
                                <td colSpan={6} className="px-4 py-10 text-center text-sm text-ink-500">No pages yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
