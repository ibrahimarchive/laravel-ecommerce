import { useRef, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

interface CategoryItem {
    id: number;
    name: string;
    slug: string;
    parent?: { name: string } | null;
    products_count: number;
    children_count: number;
    sort_order: number;
    is_active?: boolean;
}

interface Props {
    categories?: CategoryItem[];
    filters?: { q?: string; status?: string };
}

export default function CategoriesIndex({ categories = [], filters = {} }: Props) {
    const [q, setQ] = useState(filters.q ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const apply = (values: { q?: string | undefined; status?: string | undefined }) => {
        router.get('/admin/categories', { q: values.q || undefined, status: values.status || undefined }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const destroy = (category: CategoryItem) => {
        if (confirm(`Delete category "${category.name}"?`)) {
            router.delete(`/admin/categories/${category.id}`, { preserveScroll: true });
        }
    };

    return (
        <AdminLayout>
            <Head title="Categories" />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="title text-2xl">Categories</h1>
                    <p className="mt-1 text-sm text-ink-500">{categories.length} categories</p>
                </div>
                <Link href="/admin/categories/create" className="btn btn-primary btn-sm">Add category</Link>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 card-surface p-4">
                <input
                    type="search"
                    placeholder="Search category name..."
                    className="w-full max-w-xs rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                    value={q}
                    onChange={(e) => {
                        const value = e.target.value;
                        setQ(value);
                        clearTimeout(timer.current);
                        timer.current = setTimeout(() => apply({ q: value, status }), 350);
                    }}
                />
                <select
                    className="rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                    value={status}
                    onChange={(e) => {
                        const value = e.target.value;
                        setStatus(value);
                        apply({ q, status: value });
                    }}
                >
                    <option value="">All statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>

            <div className="mt-4 overflow-hidden card-surface">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-bone-300 bg-bone-50 text-xs uppercase tracking-wide text-ink-500">
                            <tr>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Parent</th>
                                <th className="px-4 py-3 text-center">Products</th>
                                <th className="px-4 py-3 text-center">Children</th>
                                <th className="px-4 py-3 text-center">Order</th>
                                <th className="px-4 py-3 text-center">Status</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-bone-100">
                            {categories.map((category) => (
                                <tr key={category.id} className="hover:bg-bone-50">
                                    <td className="px-4 py-3">
                                        <p className="font-semibold text-ink-950">{category.name}</p>
                                        <p className="text-xs text-ink-400">{category.slug}</p>
                                    </td>
                                    <td className="px-4 py-3 text-ink-600">{category.parent?.name || '—'}</td>
                                    <td className="px-4 py-3 text-center text-ink-600">{category.products_count}</td>
                                    <td className="px-4 py-3 text-center text-ink-600">{category.children_count}</td>
                                    <td className="px-4 py-3 text-center text-ink-600">{category.sort_order}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${category.is_active ? 'bg-bone-100 text-umber-800' : 'bg-bone-100 text-ink-500'}`}>
                                            {category.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-3 text-sm font-semibold">
                                            <Link href={`/admin/categories/${category.id}/edit`} className="text-umber-700 hover:text-umber-600">Edit</Link>
                                            <button type="button" onClick={() => destroy(category)} className="text-ink-700 hover:text-ink-600">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {!categories.length && (
                    <p className="px-6 py-12 text-center text-sm text-ink-500">No categories found.</p>
                )}
            </div>
        </AdminLayout>
    );
}
