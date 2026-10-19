import { useRef, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

interface BrandItem {
    id: number;
    name: string;
    slug: string;
    website?: string | null;
    products_count: number;
    sort_order: number;
    is_active?: boolean;
    is_featured?: boolean;
}

interface Props {
    brands?: BrandItem[];
    filters?: { q?: string; status?: string };
}

export default function BrandsIndex({ brands = [], filters: initialFilters = {} }: Props) {
    const [q, setQ] = useState(initialFilters.q ?? '');
    const [status, setStatus] = useState(initialFilters.status ?? '');

    const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    function applyFilters(values: { q: string; status: string }) {
        router.get('/admin/brands', { ...values }, { preserveState: true, preserveScroll: true, replace: true });
    }

    function clearFilters() {
        setQ('');
        setStatus('');
        applyFilters({ q: '', status: '' });
    }

    const [deleting, setDeleting] = useState<number | null>(null);

    function destroy(brand: BrandItem) {
        if (!confirm(`Delete brand "${brand.name}"? This cannot be undone.`)) {
            return;
        }

        setDeleting(brand.id);
        router.delete(`/admin/brands/${brand.id}`, { onFinish: () => setDeleting(null) });
    }

    return (
        <AdminLayout>
            <Head title="Brands" />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="title text-2xl">Brands</h1>
                    <p className="mt-1 text-sm text-ink-500">{brands.length} brands</p>
                </div>
                <Link href="/admin/brands/create" className="btn btn-primary btn-sm">
                    New brand
                </Link>
            </div>

            <div className="mt-6 flex flex-wrap items-end gap-3 card-surface p-4">
                <div className="flex-1 min-w-[200px]">
                    <label className="mb-1 block text-xs font-medium text-ink-500">Search</label>
                    <input
                        type="text"
                        placeholder="Brand name..."
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
                            <th className="px-4 py-3">Brand</th>
                            <th className="px-4 py-3">Website</th>
                            <th className="px-4 py-3">Products</th>
                            <th className="px-4 py-3">Order</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-bone-100">
                        {brands.map((brand) => (
                            <tr key={brand.id} className="hover:bg-bone-50">
                                <td className="px-4 py-3">
                                    <p className="font-semibold text-ink-950">{brand.name}</p>
                                    <p className="text-xs text-ink-400">{brand.slug}</p>
                                </td>
                                <td className="px-4 py-3 text-ink-600">
                                    {brand.website ? (
                                        <a href={brand.website} target="_blank" className="text-umber-700 hover:underline">{brand.website}</a>
                                    ) : (
                                        <span className="text-ink-400">—</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-ink-600">{brand.products_count}</td>
                                <td className="px-4 py-3 text-ink-600">{brand.sort_order}</td>
                                <td className="px-4 py-3">
                                    <span className={`${brand.is_active ? 'bg-bone-100 text-umber-800' : 'bg-bone-100 text-ink-600'} rounded-full px-2.5 py-1 text-xs font-semibold`}>
                                        {brand.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                    {brand.is_featured && (
                                        <span className="ml-1 rounded-full bg-bone-100 px-2.5 py-1 text-xs font-semibold text-tan-800">Featured</span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-end gap-3">
                                        <Link href={`/admin/brands/${brand.id}/edit`} className="text-sm font-semibold text-umber-700 hover:text-umber-600">Edit</Link>
                                        <button type="button" disabled={deleting === brand.id} className="text-sm font-semibold text-ink-700 hover:text-ink-600 disabled:text-bone-400" onClick={() => destroy(brand)}>
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {!brands.length && (
                            <tr>
                                <td colSpan={6} className="px-4 py-10 text-center text-sm text-ink-500">No brands found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
