import { useRef, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import type {
    BrandRef,
    CategoryRef,
    CategoryOption,
    Currency,
    PageProps,
    Paginated,
    PaginationLink,
    Product,
} from '../../types';
import StorefrontLayout from '../../Layouts/StorefrontLayout';
import ProductCard from '../../Components/ProductCard';
import Pagination from '../../Components/Pagination';

interface ShopSortOption {
    value: string;
    label: string;
}

interface ShopOptions {
    categories?: CategoryOption[];
    brands?: BrandRef[];
    sorts?: ShopSortOption[];
    price_range?: { min: number; max: number } | null;
}

interface ShopFilters {
    q?: string | number | null;
    category?: string | number | null;
    brand?: string | number | null;
    min_price?: string | number | null;
    max_price?: string | number | null;
    rating?: string | number | null;
    on_sale?: string | number | boolean | null;
    in_stock?: string | number | boolean | null;
    sort?: string | number | null;
}

interface FilterForm {
    q: string;
    category: string;
    brand: string;
    min_price: string;
    max_price: string;
    rating: string;
    on_sale: string;
    in_stock: string;
    sort: string;
}

interface Props extends PageProps {
    products: Paginated<Product>;
    filters: ShopFilters;
    options: ShopOptions;
    heading: string;
    category: CategoryRef | null;
    brand: BrandRef | null;
}

const starValues = [1, 2, 3, 4, 5];
const ratingValues = [4, 3, 2, 1];

const asText = (value: string | number | null | undefined): string =>
    value === null || value === undefined ? '' : String(value);

export default function ShopIndex({ products, filters, options, heading, category, brand }: Props) {
    const { store } = usePage<PageProps>().props;

    const currency: Currency = store?.currency ?? { code: 'USD', symbol: '$', position: 'before', decimals: 2 };

    const categoryOptions = options?.categories ?? [];
    const brandOptions = options?.brands ?? [];
    const sortOptions = options?.sorts ?? [];
    const links: PaginationLink[] = products.meta?.links ?? [];

    const [form, setForm] = useState<FilterForm>({
        q: asText(filters?.q),
        category: asText(filters?.category),
        brand: asText(filters?.brand),
        min_price: asText(filters?.min_price),
        max_price: asText(filters?.max_price),
        rating: asText(filters?.rating),
        on_sale: filters?.on_sale ? '1' : '',
        in_stock: filters?.in_stock ? '1' : '',
        sort: asText(filters?.sort),
    });

    const [filtersOpen, setFiltersOpen] = useState(false);

    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const activeCount = ['q', 'category', 'brand', 'min_price', 'max_price', 'rating', 'on_sale', 'in_stock'].filter(
        (key) => form[key as keyof FilterForm],
    ).length;

    const currentCategory = (() => {
        const slug = form.category;
        if (!slug) {
            return null;
        }
        const flat = categoryOptions.flatMap((item) => [item, ...(item.children ?? [])]);

        return flat.find((item) => item.slug === slug) ?? null;
    })();

    function query(values: FilterForm) {
        return Object.fromEntries(
            Object.entries(values).filter(([, value]) => value !== '' && value !== null && value !== undefined),
        );
    }

    function apply(values: FilterForm) {
        router.get('/shop', query(values), { preserveState: true, preserveScroll: true, replace: true });
    }

    function search(value: string) {
        const next = { ...form, q: value };
        setForm(next);

        if (searchTimer.current) {
            clearTimeout(searchTimer.current);
        }
        searchTimer.current = setTimeout(() => apply(next), 350);
    }

    function sortBy(value: string) {
        const next = { ...form, sort: value };
        setForm(next);
        apply(next);
    }

    function toggleFlag(key: 'on_sale' | 'in_stock') {
        const next: FilterForm =
            key === 'on_sale'
                ? { ...form, on_sale: form.on_sale ? '' : '1' }
                : { ...form, in_stock: form.in_stock ? '' : '1' };
        setForm(next);
        apply(next);
    }

    function setRating(value: number) {
        const next = { ...form, rating: form.rating === String(value) ? '' : String(value) };
        setForm(next);
        apply(next);
    }

    function setCategory(slug: string) {
        const next = { ...form, category: form.category === slug ? '' : slug };
        setForm(next);
        apply(next);
    }

    function setBrand(slug: string) {
        const next = { ...form, brand: form.brand === slug ? '' : slug };
        setForm(next);
        apply(next);
    }

    function clearAll() {
        const next: FilterForm = {
            q: '',
            category: '',
            brand: '',
            min_price: '',
            max_price: '',
            rating: '',
            on_sale: '',
            in_stock: '',
            sort: form.sort,
        };
        setForm(next);
        apply(next);
    }

    return (
        <StorefrontLayout>
            <Head title={heading} />

            {/* Page head */}
            <section className="border-b border-bone-300 bg-canvas-deep">
                <div className="container-page py-10 lg:py-14">
                    <nav className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink-400">
                        <Link href="/" className="transition hover:text-umber-700">Home</Link>
                        <span className="text-bone-400">/</span>
                        {category || brand ? (
                            <span className="text-ink-600">{category?.name ?? brand?.name}</span>
                        ) : (
                            <span className="text-ink-600">Shop</span>
                        )}
                    </nav>

                    <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <p className="eyebrow">{products.meta?.total ?? 0} products</p>
                            <h1 className="title mt-2 text-3xl sm:text-4xl">{heading}</h1>
                        </div>

                        <button type="button" className="btn btn-outline btn-sm lg:hidden" onClick={() => setFiltersOpen((open) => !open)}>
                            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                                <path d="M3 5h18v2H3V5Zm3 6h12v2H6v-2Zm3 6h6v2H9v-2Z" />
                            </svg>
                            Filters{activeCount > 0 && <span> ({activeCount})</span>}
                        </button>
                    </div>
                </div>
            </section>

            <section className="py-10 lg:py-14">
                <div className="container-page grid gap-10 lg:grid-cols-[280px_1fr]">
                    {/* Filters */}
                    <aside className={filtersOpen ? 'block' : 'hidden lg:block'}>
                        <div className="lg:sticky lg:top-24 space-y-8">
                            <div>
                                <label className="label" htmlFor="shop-search">Search</label>
                                <input id="shop-search" value={form.q} onChange={(event) => search(event.target.value)} type="search" className="input" placeholder="Search products..." />
                            </div>

                            {categoryOptions.length > 0 && (
                                <div>
                                    <p className="eyebrow">Categories</p>
                                    <ul className="mt-3 space-y-1.5 text-sm">
                                        {categoryOptions.map((item) => (
                                            <li key={item.id}>
                                                <button
                                                    type="button"
                                                    className={`w-full text-left transition ${form.category === item.slug ? 'font-semibold text-umber-700' : 'text-ink-700 hover:text-ink-950'}`}
                                                    onClick={() => setCategory(item.slug)}
                                                >
                                                    {item.name}
                                                </button>
                                                {item.children?.length ? (
                                                    <ul className="mt-1.5 space-y-1.5 border-l border-bone-300 pl-4">
                                                        {item.children.map((child) => (
                                                            <li key={child.id}>
                                                                <button
                                                                    type="button"
                                                                    className={`w-full text-left text-[13px] transition ${form.category === child.slug ? 'font-semibold text-umber-700' : 'text-ink-500 hover:text-ink-900'}`}
                                                                    onClick={() => setCategory(child.slug)}
                                                                >
                                                                    {child.name}
                                                                </button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : null}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {brandOptions.length > 0 && (
                                <div>
                                    <p className="eyebrow">Brands</p>
                                    <ul className="mt-3 space-y-1.5 text-sm">
                                        {brandOptions.map((item) => (
                                            <li key={item.id}>
                                                <button
                                                    type="button"
                                                    className={`w-full text-left transition ${form.brand === item.slug ? 'font-semibold text-umber-700' : 'text-ink-700 hover:text-ink-950'}`}
                                                    onClick={() => setBrand(item.slug)}
                                                >
                                                    {item.name}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div>
                                <p className="eyebrow">Price</p>
                                <div className="mt-3 flex items-center gap-3">
                                    <input
                                        value={form.min_price}
                                        onChange={(event) => setForm({ ...form, min_price: event.target.value })}
                                        onBlur={() => apply(form)}
                                        type="number"
                                        min="0"
                                        className="input"
                                        placeholder="Min"
                                    />
                                    <span className="text-ink-300">–</span>
                                    <input
                                        value={form.max_price}
                                        onChange={(event) => setForm({ ...form, max_price: event.target.value })}
                                        onBlur={() => apply(form)}
                                        type="number"
                                        min="0"
                                        className="input"
                                        placeholder="Max"
                                    />
                                </div>
                                {options?.price_range && (
                                    <p className="mt-2 text-xs text-ink-400">
                                        Range: {currency.symbol}{Math.floor(options.price_range.min)} –
                                        {' '}{currency.symbol}{Math.ceil(options.price_range.max)}
                                    </p>
                                )}
                            </div>

                            <div>
                                <p className="eyebrow">Rating</p>
                                <div className="mt-3 space-y-1.5">
                                    {ratingValues.map((value) => (
                                        <button
                                            key={value}
                                            type="button"
                                            className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition ${form.rating === String(value) ? 'bg-tan-400/25 text-umber-700' : 'text-ink-600 hover:bg-bone-100'}`}
                                            onClick={() => setRating(value)}
                                        >
                                            <span className={`flex gap-0.5 ${form.rating === String(value) ? 'text-tan-600' : 'text-ink-300'}`}>
                                                {starValues.map((star) => (
                                                    <svg key={star} viewBox="0 0 20 20" className={`h-3.5 w-3.5 ${star <= value ? 'fill-current' : 'fill-bone-300'}`}>
                                                        <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
                                                    </svg>
                                                ))}
                                            </span>
                                            and up
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <p className="eyebrow">Availability</p>
                                <div className="mt-3 space-y-2 text-sm">
                                    <label className="flex cursor-pointer items-center gap-2.5 text-ink-700">
                                        <input type="checkbox" className="h-4 w-4 rounded border-bone-400 text-umber-700 focus:ring-tan-400" checked={!!form.on_sale} onChange={() => toggleFlag('on_sale')} />
                                        On sale
                                    </label>
                                    <label className="flex cursor-pointer items-center gap-2.5 text-ink-700">
                                        <input type="checkbox" className="h-4 w-4 rounded border-bone-400 text-umber-700 focus:ring-tan-400" checked={!!form.in_stock} onChange={() => toggleFlag('in_stock')} />
                                        In stock only
                                    </label>
                                </div>
                            </div>

                            {activeCount > 0 && (
                                <button type="button" className="btn btn-ghost btn-sm w-full justify-center" onClick={clearAll}>
                                    Clear all filters
                                </button>
                            )}
                        </div>
                    </aside>

                    {/* Results */}
                    <div>
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-bone-300 pb-4">
                            <p className="text-sm text-ink-500">
                                Showing{' '}
                                <span className="font-semibold text-ink-900">{products.data?.length ?? 0}</span> of{' '}
                                <span className="font-semibold text-ink-900">{products.meta?.total ?? 0}</span> results
                                {currentCategory && (
                                    <span> in <span className="font-semibold text-umber-700">{currentCategory.name}</span></span>
                                )}
                            </p>

                            <div className="flex items-center gap-2">
                                <label className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-400" htmlFor="shop-sort">Sort</label>
                                <select id="shop-sort" value={form.sort} onChange={(event) => sortBy(event.target.value)} className="select !w-auto">
                                    <option value="">Newest</option>
                                    {sortOptions.map((option) => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {products.data?.length ? (
                            <div className="mt-8 grid grid-cols-2 gap-5 lg:grid-cols-3">
                                {products.data.map((product) => (
                                    <ProductCard key={product.id} product={product} currency={currency} />
                                ))}
                            </div>
                        ) : (
                            <div className="mt-8 rounded-2xl border border-dashed border-bone-400 bg-canvas-deep px-6 py-20 text-center">
                                <p className="font-display text-2xl italic text-umber-700">Nothing here yet</p>
                                <p className="mx-auto mt-2 max-w-sm text-sm text-ink-500">
                                    We couldn't find products matching your filters. Try widening your search.
                                </p>
                                <button type="button" className="btn btn-primary btn-sm mt-6" onClick={clearAll}>Reset filters</button>
                            </div>
                        )}

                        <Pagination links={links} />
                    </div>
                </div>
            </section>
        </StorefrontLayout>
    );
}
