import { useRef, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Pagination from '../../../Components/Pagination';
import type { BrandRef, CategoryOption, PageProps, Paginated, Product } from '../../../types';

type ProductPaginator = Paginated<Product> & { meta: NonNullable<Paginated<Product>['meta']> };

interface Props extends PageProps {
    products: ProductPaginator;
    filters: { q?: string; category?: string | number; brand?: string | number; status?: string; sort?: string };
    categories: CategoryOption[];
    brands: BrandRef[];
}

export default function ProductsIndex({ products, filters = {}, categories = [], brands = [] }: Props) {
    const [q, setQ] = useState(filters.q ?? '');
    const [category, setCategory] = useState(String(filters.category ?? ''));
    const [brand, setBrand] = useState(String(filters.brand ?? ''));
    const [status, setStatus] = useState(filters.status ?? '');
    const [sort, setSort] = useState(filters.sort ?? 'latest');
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const apply = (next: { q: string; category: string; brand: string; status: string; sort: string }) => {
        router.get(
            '/admin/products',
            {
                q: next.q || undefined,
                category: next.category || undefined,
                brand: next.brand || undefined,
                status: next.status || undefined,
                sort: next.sort || undefined,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const onSearchChange = (value: string) => {
        setQ(value);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => apply({ q: value, category, brand, status, sort }), 350);
    };

    const onCategoryChange = (value: string) => {
        setCategory(value);
        apply({ q, category: value, brand, status, sort });
    };

    const onBrandChange = (value: string) => {
        setBrand(value);
        apply({ q, category, brand: value, status, sort });
    };

    const onStatusChange = (value: string) => {
        setStatus(value);
        apply({ q, category, brand, status: value, sort });
    };

    const onSortChange = (value: string) => {
        setSort(value);
        apply({ q, category, brand, status, sort: value });
    };

    const destroy = (product: Product) => {
        if (confirm(`Move "${product.name}" to trash?`)) {
            router.delete(`/admin/products/${product.id}`, { preserveScroll: true });
        }
    };

    return (
        <AdminLayout>
            <Head title="Products" />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="title text-2xl">Products</h1>
                    <p className="mt-1 text-sm text-ink-500">{products.meta.total} products</p>
                </div>
                <Link href="/admin/products/create" className="btn btn-primary btn-sm">Add product</Link>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 card-surface p-4">
                <input
                    value={q}
                    onChange={(e) => onSearchChange(e.target.value)}
                    type="search"
                    placeholder="Search name or SKU..."
                    className="w-full max-w-xs rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                />
                <select
                    value={category}
                    onChange={(e) => onCategoryChange(e.target.value)}
                    className="rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                >
                    <option value="">All categories</option>
                    {categories.map((option) => (
                        <option key={option.id} value={option.id}>{option.name}</option>
                    ))}
                </select>
                <select
                    value={brand}
                    onChange={(e) => onBrandChange(e.target.value)}
                    className="rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                >
                    <option value="">All brands</option>
                    {brands.map((option) => (
                        <option key={option.id} value={option.id}>{option.name}</option>
                    ))}
                </select>
                <select
                    value={status}
                    onChange={(e) => onStatusChange(e.target.value)}
                    className="rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                >
                    <option value="">All statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="low_stock">Low stock</option>
                </select>
                <select
                    value={sort}
                    onChange={(e) => onSortChange(e.target.value)}
                    className="rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                >
                    <option value="latest">Newest</option>
                    <option value="name">Name</option>
                    <option value="price">Price</option>
                    <option value="stock">Stock</option>
                </select>
            </div>

            <div className="mt-4 overflow-hidden card-surface">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-bone-300 bg-bone-50 text-xs uppercase tracking-wide text-ink-500">
                            <tr>
                                <th className="px-4 py-3">Product</th>
                                <th className="px-4 py-3">Category</th>
                                <th className="px-4 py-3">Price</th>
                                <th className="px-4 py-3 text-center">Stock</th>
                                <th className="px-4 py-3 text-center">Status</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-bone-100">
                            {products.data.map((product) => (
                                <tr key={product.id} className="hover:bg-bone-50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <img src={product.image} alt={product.name} className="h-10 w-10 rounded-lg object-cover" />
                                            <div>
                                                <p className="font-semibold text-ink-950">{product.name}</p>
                                                <p className="text-xs text-ink-400">{product.sku || '—'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-ink-600">{product.category?.name || '—'}</td>
                                    <td className="px-4 py-3 font-medium text-ink-950">{product.price_formatted}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={product.low_stock ? 'text-ink-700 font-semibold' : 'text-ink-600'}>{product.stock_quantity}</span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${product.is_active ? 'bg-bone-100 text-umber-800' : 'bg-bone-100 text-ink-500'}`}>
                                            {product.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-3 text-sm font-semibold">
                                            <Link href={`/admin/products/${product.id}/edit`} className="text-umber-700 hover:text-umber-600">Edit</Link>
                                            <button type="button" onClick={() => destroy(product)} className="text-ink-700 hover:text-ink-600">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {!products.data.length && <p className="px-6 py-12 text-center text-sm text-ink-500">No products match your filters.</p>}
            </div>

            <div className="mt-6">
                <Pagination links={products.meta.links} />
            </div>
        </AdminLayout>
    );
}
