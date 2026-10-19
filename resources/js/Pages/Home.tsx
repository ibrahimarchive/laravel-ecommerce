import { Head, Link, useForm, usePage } from '@inertiajs/react';
import type { BrandRef, CategoryOption, Currency, PageProps, Product } from '../types';
import StorefrontLayout from '../Layouts/StorefrontLayout';
import ProductCard from '../Components/ProductCard';

interface Benefit {
    title: string;
    copy: string;
    path: string;
}

interface Reason {
    title: string;
    copy: string;
}

interface Props extends PageProps {
    featuredProducts: Product[];
    newArrivals: Product[];
    onSaleProducts: Product[];
    categories: CategoryOption[];
    brands: BrandRef[];
}

const reasons: Reason[] = [
    { title: 'Curated, not cluttered', copy: 'Every piece is chosen by hand and photographed the way you will actually wear it.' },
    { title: 'Made to last', copy: 'We work with mills and makers we have visited, so quality is something you can feel.' },
    { title: 'Priced with honesty', copy: 'No inflated list prices. What you see is what the piece is worth.' },
];

export default function Home({ featuredProducts, newArrivals, onSaleProducts, categories, brands }: Props) {
    const { store } = usePage<PageProps>().props;

    const currency: Currency = store?.currency ?? { code: 'USD', symbol: '$', position: 'before', decimals: 2 };
    const freeShipping = store?.free_shipping_threshold ?? 0;

    const heroProduct = featuredProducts[0] ?? newArrivals[0] ?? null;
    const heroSecondary = newArrivals[0] ?? featuredProducts[1] ?? null;

    const benefits: Benefit[] = [
        {
            title: 'Free shipping',
            copy: `On every order over ${currency.symbol}${freeShipping}`,
            path: 'M3 7h11v8H3zM14 10h4l3 3v2h-7zM6.5 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm11 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z',
        },
        {
            title: 'Easy returns',
            copy: 'Thirty days to change your mind',
            path: 'M12 5V2L7 6l5 4V7a5 5 0 11-5 5H5a7 7 0 107-7z',
        },
        {
            title: 'Secure checkout',
            copy: 'Encrypted payments, always',
            path: 'M12 2l7 3v6c0 4.5-3 8.3-7 9.5C8 19.3 5 15.5 5 11V5l7-3zm0 4a2 2 0 00-2 2v1H9v5h6v-5h-1V8a2 2 0 00-2-2zm0 1.5a.5.5 0 01.5.5v1h-1V8a.5.5 0 01.5-.5z',
        },
        {
            title: 'Human support',
            copy: 'Real people, Monday to Friday',
            path: 'M12 3a6 6 0 00-6 6v4a3 3 0 003 3h1v-7H8V9a4 4 0 118 0v3h-2v7h1a3 3 0 003-3v-4a6 6 0 00-6-6z',
        },
    ];

    const newsletter = useForm({ email: '', name: '' });

    const subscribe = () => {
        newsletter.post('/newsletter', {
            preserveScroll: true,
            onSuccess: () => newsletter.reset(),
        });
    };

    return (
        <StorefrontLayout>
            <Head title="Home" />

            {/* Hero */}
            <section className="panel-warm border-b border-bone-300">
                <div className="container-page grid items-center gap-14 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
                    <div>
                        <p className="eyebrow">New season edit</p>
                        <h1 className="mt-5 title text-4xl leading-[1.08] sm:text-5xl lg:text-6xl">
                            Unleash your <b>style</b> with our new collection
                        </h1>
                        <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-600">
                            Considered essentials for everyday wear — clean lines, honest materials and a palette
                            that works as hard as you do.
                        </p>

                        <div className="mt-9 flex flex-wrap items-center gap-3">
                            <Link href="/shop" className="btn btn-primary">Shop the collection</Link>
                            <Link href="/shop?sort=latest" className="btn btn-outline">See new arrivals</Link>
                        </div>

                        <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-bone-400/70 pt-8">
                            <div>
                                <dt className="text-xs uppercase tracking-[0.18em] text-ink-400">Shipping</dt>
                                <dd className="mt-1.5 text-sm font-semibold text-ink-900">
                                    Free over {currency.symbol}{freeShipping}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs uppercase tracking-[0.18em] text-ink-400">Returns</dt>
                                <dd className="mt-1.5 text-sm font-semibold text-ink-900">30 days, no fuss</dd>
                            </div>
                            <div>
                                <dt className="text-xs uppercase tracking-[0.18em] text-ink-400">Payment</dt>
                                <dd className="mt-1.5 text-sm font-semibold text-ink-900">Secure & encrypted</dd>
                            </div>
                        </dl>
                    </div>

                    <div className="relative">
                        <div className="grid grid-cols-5 gap-4">
                            <div className="col-span-3">
                                <div className="overflow-hidden rounded-2xl border border-bone-300 bg-bone-200 shadow-lift">
                                    {heroProduct ? (
                                        <img
                                            src={heroProduct.image}
                                            alt={heroProduct.name}
                                            className="aspect-[4/5] h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="aspect-[4/5] h-full w-full bg-bone-200" />
                                    )}
                                </div>
                            </div>
                            <div className="col-span-2 space-y-4 pt-10">
                                <div className="overflow-hidden rounded-2xl border border-bone-300 bg-bone-200 shadow-soft">
                                    {heroSecondary ? (
                                        <img
                                            src={heroSecondary.image}
                                            alt={heroSecondary.name}
                                            className="aspect-square w-full object-cover"
                                        />
                                    ) : (
                                        <div className="aspect-square h-full w-full bg-bone-200" />
                                    )}
                                </div>
                                {heroProduct && (
                                    <div className="card-surface p-4">
                                        <p className="eyebrow">Editor's pick</p>
                                        <Link href={heroProduct.url} className="mt-1.5 block text-sm font-medium text-ink-950 hover:text-umber-700">
                                            {heroProduct.name}
                                        </Link>
                                        <p className="mt-1 font-display text-lg text-umber-700">{heroProduct.price_formatted}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section className="border-b border-bone-300 py-10">
                <div className="container-page grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {benefits.map((item) => (
                        <div key={item.title} className="flex items-start gap-4">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-tan-400/25 text-umber-700">
                                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d={item.path} /></svg>
                            </span>
                            <div>
                                <p className="text-sm font-semibold text-ink-950">{item.title}</p>
                                <p className="mt-0.5 text-sm text-ink-500">{item.copy}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Categories */}
            {categories.length > 0 && (
                <section className="py-16 lg:py-20">
                    <div className="container-page">
                        <div className="flex flex-wrap items-end justify-between gap-4">
                            <div>
                                <p className="eyebrow">Browse</p>
                                <h2 className="mt-3 title text-3xl sm:text-4xl">Trending <b>outfits</b> of the season</h2>
                            </div>
                            <Link href="/shop" className="btn btn-ghost btn-sm">All categories</Link>
                        </div>

                        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {categories.map((category) => (
                                <Link
                                    key={category.id}
                                    href={category.url}
                                    className="group relative flex min-h-56 flex-col justify-end overflow-hidden rounded-2xl border border-bone-300 bg-gradient-to-br from-bone-200 via-bone-100 to-tan-200/60 p-6 transition hover:border-tan-400 hover:shadow-lift"
                                >
                                    {category.image && (
                                        <img
                                            src={category.image}
                                            alt={category.name}
                                            className="absolute inset-0 h-full w-full object-cover opacity-90 transition duration-700 group-hover:scale-105"
                                        />
                                    )}
                                    <span className="relative font-display text-6xl leading-none text-tan-600/40">
                                        {category.name.charAt(0)}
                                    </span>
                                    <div className="relative mt-4 flex items-end justify-between gap-3">
                                        <div>
                                            <h3 className="text-lg font-medium text-ink-950">{category.name}</h3>
                                            <p className="mt-0.5 text-xs uppercase tracking-[0.18em] text-umber-600">Shop now</p>
                                        </div>
                                        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-950/15 text-ink-900 transition group-hover:bg-ink-950 group-hover:text-bone-100">
                                            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* New arrivals */}
            {newArrivals.length > 0 && (
                <section className="border-y border-bone-300 bg-canvas-deep py-16 lg:py-20">
                    <div className="container-page">
                        <div className="flex flex-wrap items-end justify-between gap-4">
                            <div>
                                <p className="eyebrow">Just landed</p>
                                <h2 className="mt-3 title text-3xl sm:text-4xl">Trending <b>products</b></h2>
                            </div>
                            <Link href="/shop?sort=latest" className="btn btn-ghost btn-sm">View all</Link>
                        </div>

                        <div className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-4">
                            {newArrivals.slice(0, 8).map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    currency={currency}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Sale band */}
            {onSaleProducts.length > 0 && (
                <section className="band-dark">
                    <div className="container-page grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-20">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-tan-400">Limited time</p>
                            <h2 className="mt-4 title text-3xl !text-bone-100 sm:text-4xl lg:text-5xl">
                                New collection in this <b className="!text-tan-400">season</b> sale
                            </h2>
                            <p className="mt-5 max-w-lg text-base leading-relaxed text-bone-200/80">
                                A handful of pieces we love, reduced while stock lasts. Same quality, gentler price.
                            </p>
                            <Link href="/shop?on_sale=1" className="btn btn-accent mt-8">Shop the sale</Link>
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            {onSaleProducts.slice(0, 2).map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    currency={currency}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Featured */}
            {featuredProducts.length > 0 && (
                <section className="py-16 lg:py-20">
                    <div className="container-page">
                        <div className="flex flex-wrap items-end justify-between gap-4">
                            <div>
                                <p className="eyebrow">Handpicked</p>
                                <h2 className="mt-3 title text-3xl sm:text-4xl">Our featured <b>products</b></h2>
                            </div>
                            <Link href="/shop" className="btn btn-ghost btn-sm">Browse shop</Link>
                        </div>

                        <div className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-4">
                            {featuredProducts.slice(0, 8).map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    currency={currency}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Why shop with us */}
            <section className="border-y border-bone-300 bg-canvas-deep py-16 lg:py-20">
                <div className="container-page">
                    <div className="max-w-2xl">
                        <p className="eyebrow">Our promise</p>
                        <h2 className="mt-3 title text-3xl sm:text-4xl">Why shop <b>with us</b>?</h2>
                    </div>

                    <div className="mt-12 grid gap-10 md:grid-cols-3">
                        {reasons.map((reason, index) => (
                            <div key={reason.title} className="border-t border-bone-400 pt-6">
                                <span className="font-display text-2xl text-tan-600">{String(index + 1).padStart(2, '0')}</span>
                                <h3 className="mt-3 text-base font-semibold text-ink-950">{reason.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-ink-500">{reason.copy}</p>
                            </div>
                        ))}
                    </div>

                    {brands.length > 0 && (
                        <div className="mt-14 flex flex-wrap items-center gap-3 border-t border-bone-400 pt-8">
                            <span className="eyebrow mr-2">Brands</span>
                            {brands.map((brand) => (
                                <Link
                                    key={brand.id}
                                    href={brand.url}
                                    className="rounded-full border border-bone-400 px-4 py-1.5 text-sm text-ink-700 transition hover:border-tan-400 hover:bg-bone-100"
                                >
                                    {brand.name}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Newsletter */}
            <section className="band-dark">
                <div className="container-page grid items-center gap-10 py-16 lg:grid-cols-2 lg:py-20">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-tan-400">Newsletter</p>
                        <h2 className="mt-4 max-w-lg text-2xl font-medium leading-snug text-bone-100 sm:text-3xl">
                            Subscribe and get updates on our latest <b className="font-display font-normal italic text-tan-400">collection</b>
                        </h2>
                    </div>

                    <form
                        className="lg:justify-self-end lg:w-full lg:max-w-lg"
                        onSubmit={(event) => {
                            event.preventDefault();
                            subscribe();
                        }}
                    >
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <input
                                value={newsletter.data.email}
                                onChange={(event) => newsletter.setData('email', event.target.value)}
                                type="email"
                                required
                                placeholder="you@example.com"
                                className="input flex-1 !border-bone-100/25 !bg-ink-950/40 !text-bone-100 placeholder:!text-bone-200/40"
                            />
                            <button type="submit" className="btn btn-accent shrink-0" disabled={newsletter.processing}>
                                {newsletter.processing ? 'Subscribing...' : 'Subscribe now'}
                            </button>
                        </div>
                        {newsletter.errors.email ? (
                            <p className="mt-2 text-sm text-tan-300">{newsletter.errors.email}</p>
                        ) : (
                            <p className="mt-3 text-xs text-bone-200/60">No spam. Unsubscribe at any time.</p>
                        )}
                    </form>
                </div>
            </section>
        </StorefrontLayout>
    );
}
