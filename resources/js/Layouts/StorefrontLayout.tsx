import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import type { PageProps } from '../types';

/* `PageProps` is an interface, so it has no implicit index signature. Inertia's
   `usePage` generic is constrained to `Record<string, unknown>`, so this
   structural copy keeps every shared prop typed while satisfying it. */

const navLinks = [
    { label: 'Shop', href: '/shop' },
    { label: 'New Arrivals', href: '/shop?sort=latest' },
    { label: 'On Sale', href: '/shop?on_sale=1' },
    { label: 'Contact', href: '/contact' },
];

const footerShopLinks = [
    { label: 'All products', href: '/shop' },
    { label: 'New arrivals', href: '/shop?sort=latest' },
    { label: 'On sale', href: '/shop?on_sale=1' },
    { label: 'My account', href: '/account' },
    { label: 'My wishlist', href: '/account/wishlist' },
];

const accountLinks = [
    { label: 'Dashboard', href: '/account' },
    { label: 'Orders', href: '/account/orders' },
    { label: 'Wishlist', href: '/account/wishlist' },
    { label: 'Addresses', href: '/account/addresses' },
    { label: 'Profile', href: '/account/profile' },
];

function socialIcon(network: string): ReactNode {
    if (network === 'facebook') {
        return (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.8c0-.9.25-1.5 1.55-1.5H16.7V3.5c-.29-.04-1.28-.12-2.43-.12-2.4 0-4.05 1.47-4.05 4.16V9.9H7.5V13h2.72v8h3.28Z" />
            </svg>
        );
    }

    if (network === 'instagram') {
        return (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
                <circle cx="12" cy="12" r="3.8" />
                <circle cx="16.9" cy="7.1" r="1" fill="currentColor" stroke="none" />
            </svg>
        );
    }

    if (network === 'twitter') {
        return (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.6 3h3.1l-6.8 7.8L21.9 21h-6l-4.7-6.2L5.8 21H2.7l7.1-8.1L2.4 3h6.1l4.4 5.8L17.6 3Zm-1.1 16.2h1.7L7.5 4.7H5.7l10.8 14.5Z" />
            </svg>
        );
    }

    if (network === 'youtube') {
        return (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.6 7.6a2.6 2.6 0 0 0-1.8-1.8C18.2 5.3 12 5.3 12 5.3s-6.2 0-7.8.5a2.6 2.6 0 0 0-1.8 1.8A27 27 0 0 0 2 12c0 1.5.1 3 .4 4.4a2.6 2.6 0 0 0 1.8 1.8c1.6.5 7.8.5 7.8.5s6.2 0 7.8-.5a2.6 2.6 0 0 0 1.8-1.8c.3-1.4.4-2.9.4-4.4s-.1-3-.4-4.4ZM10.2 15V9l5.2 3-5.2 3Z" />
            </svg>
        );
    }

    return null;
}

export default function StorefrontLayout({ children }: { children: ReactNode }) {
    const page = usePage<PageProps>();
    const { auth, cart, store, flash, footerPages } = page.props;

    const [mobileOpen, setMobileOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [accountOpen, setAccountOpen] = useState(false);
    const [search, setSearch] = useState('');

    const social = store.social ?? {};
    const currency = store.currency ?? { symbol: '$' };

    const hasFlash = Boolean(flash.success || flash.error || flash.info);

    const currentUrl = page.url.split('?')[0];

    const isActive = (href: string) => {
        const path = href.split('?')[0];

        if (path === '/') {
            return currentUrl === '/';
        }

        return currentUrl === path || currentUrl.startsWith(`${path}/`);
    };

    const submitSearch = () => {
        const term = search.trim();

        setSearchOpen(false);
        router.get('/shop', term ? { q: term } : {}, { preserveState: false });
    };

    const brandInitial = (store.name ?? 'S').charAt(0).toUpperCase();
    const firstName = (auth.user?.name ?? '').split(' ')[0];

    return (
        <div className="flex min-h-screen flex-col">
            {/* ==================================================== top tag bar */}
            <div className="bg-ink-950 text-bone-200">
                <div className="container-page flex h-10 items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-5">
                        <span className="hidden items-center gap-1.5 sm:inline-flex">
                            <svg className="h-3.5 w-3.5 text-tan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                                <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" />
                                <circle cx="12" cy="10" r="2.5" />
                            </svg>
                            {store.country === 'US' ? 'Phoenix, USA' : store.address?.split(',')?.pop()?.trim() || 'Warehouse'}
                        </span>
                        {store.email ? (
                            <a href={`mailto:${store.email}`} className="hidden items-center gap-1.5 transition hover:text-tan-300 md:inline-flex">
                                <svg className="h-3.5 w-3.5 text-tan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                                    <rect x="3" y="5" width="18" height="14" rx="2" />
                                    <path d="m3.5 7 8.5 6 8.5-6" />
                                </svg>
                                {store.email}
                            </a>
                        ) : null}
                    </div>

                    <div className="flex items-center gap-4">
                        {store.phone ? (
                            <a href={`tel:${store.phone}`} className="inline-flex items-center gap-1.5 transition hover:text-tan-300">
                                <svg className="h-3.5 w-3.5 text-tan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                                    <path d="M4 5c0-.6.4-1 1-1h2.2c.5 0 .9.3 1 .8l.7 3c.1.4-.1.8-.4 1l-1.3.9a12 12 0 0 0 5.1 5.1l.9-1.3c.2-.3.6-.5 1-.4l3 .7c.5.1.8.5.8 1V19c0 .6-.4 1-1 1h-1A13 13 0 0 1 4 6V5Z" />
                                </svg>
                                {store.phone}
                            </a>
                        ) : null}
                        <span className="hidden h-3.5 w-px bg-bone-100/20 sm:block"></span>
                        <Link href="/shop" className="hidden text-bone-300 transition hover:text-tan-300 sm:inline-flex">
                            Free shipping over {currency.symbol}{Math.round(store.free_shipping_threshold ?? 0)}
                        </Link>
                    </div>
                </div>
            </div>

            {/* ======================================================= navbar */}
            <header className="sticky top-0 z-40 border-b border-bone-300/80 bg-canvas/85 backdrop-blur-md">
                <div className="container-page flex h-[68px] items-center gap-4">
                    <button
                        type="button"
                        className="btn btn-ghost -ml-2 px-2 py-2 lg:hidden"
                        aria-label="Open menu"
                        onClick={() => setMobileOpen(true)}
                    >
                        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M4 7h16M4 12h16M4 17h16" />
                        </svg>
                    </button>

                    <Link href="/" className="group flex items-center gap-2.5">
                        <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink-950 font-display text-lg text-tan-300 transition group-hover:bg-charcoal-900">
                            {brandInitial}
                        </span>
                        <span className="leading-none">
                            <span className="block text-[17px] font-bold tracking-tight text-ink-950">{store.name}</span>
                            <span className="mt-0.5 hidden text-[10px] font-medium uppercase tracking-[0.18em] text-umber-500 sm:block">
                                Everyday essentials
                            </span>
                        </span>
                    </Link>

                    <nav className="mx-auto hidden items-center gap-1 lg:flex">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={
                                    'relative rounded-lg px-3.5 py-2 text-sm font-medium transition ' +
                                    (isActive(link.href) ? 'text-ink-950' : 'text-ink-600 hover:text-ink-950')
                                }
                            >
                                {link.label}
                                {isActive(link.href) ? (
                                    <span className="absolute inset-x-3.5 -bottom-px h-0.5 rounded-full bg-umber-600"></span>
                                ) : null}
                            </Link>
                        ))}
                    </nav>

                    <div className="ml-auto flex items-center gap-1 lg:ml-0">
                        <button
                            type="button"
                            className="btn btn-ghost px-2.5 py-2.5"
                            aria-label="Search"
                            onClick={() => setSearchOpen(true)}
                        >
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <circle cx="11" cy="11" r="6.5" />
                                <path d="m16 16 4.5 4.5" />
                            </svg>
                        </button>

                        {auth.user ? (
                            <div className="relative hidden sm:block">
                                <button
                                    type="button"
                                    className="btn btn-ghost gap-2 px-2.5 py-2"
                                    onClick={() => setAccountOpen((open) => !open)}
                                >
                                    <span className="grid h-7 w-7 place-items-center rounded-full bg-charcoal-900 text-xs font-semibold text-bone-100">
                                        {brandInitial || firstName.charAt(0)}
                                    </span>
                                    <span className="hidden text-sm font-medium text-ink-800 xl:inline">{firstName}</span>
                                    <svg className="hidden h-3.5 w-3.5 text-ink-400 xl:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="m6 9 6 6 6-6" />
                                    </svg>
                                </button>

                                {accountOpen ? (
                                    <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden card-surface shadow-lift">
                                        <div className="border-b border-bone-200 bg-bone-50 px-4 py-3">
                                            <p className="text-sm font-semibold text-ink-950">Hi, {firstName}</p>
                                            <p className="truncate text-xs text-ink-500">{auth.user.email}</p>
                                        </div>
                                        <div className="py-1">
                                            {accountLinks.map((link) => (
                                                <Link
                                                    key={link.href}
                                                    href={link.href}
                                                    className="block px-4 py-2 text-sm text-ink-700 transition hover:bg-bone-100 hover:text-ink-950"
                                                >
                                                    {link.label}
                                                </Link>
                                            ))}
                                            {auth.user.is_admin ? (
                                                <Link
                                                    href="/admin"
                                                    className="block border-t border-bone-200 px-4 py-2 text-sm font-semibold text-umber-700 transition hover:bg-bone-100"
                                                >
                                                    Admin panel
                                                </Link>
                                            ) : null}
                                            <Link
                                                href="/logout"
                                                method="post"
                                                as="button"
                                                className="block w-full border-t border-bone-200 px-4 py-2 text-left text-sm text-ink-700 transition hover:bg-bone-100 hover:text-ink-950"
                                            >
                                                Sign out
                                            </Link>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        ) : (
                            <Link href="/login" className="btn btn-ghost hidden px-3 py-2 text-sm sm:inline-flex">
                                Sign in
                            </Link>
                        )}

                        <button
                            type="button"
                            className="btn btn-ghost relative px-2.5 py-2.5"
                            aria-label="Open cart"
                            onClick={() => setCartOpen(true)}
                        >
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <path d="M4 5h2l1.6 9.2a2 2 0 0 0 2 1.6h6.8a2 2 0 0 0 2-1.6L20 8H6.5" />
                                <circle cx="10" cy="19" r="1.4" />
                                <circle cx="17" cy="19" r="1.4" />
                            </svg>
                            {cart.items_count ? (
                                <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-[20px] place-items-center rounded-full bg-umber-700 px-1 text-[10px] font-bold text-bone-100">
                                    {cart.items_count}
                                </span>
                            ) : null}
                        </button>

                        <Link href="/cart" className="btn btn-primary btn-sm hidden lg:inline-flex">Cart</Link>
                    </div>
                </div>

                {/* flash banners */}
                {hasFlash ? (
                    <div className="border-t border-bone-300/70 bg-bone-100">
                        <div className="container-page py-2.5">
                            {flash.success ? (
                                <p className="flex items-center gap-2 text-sm font-medium text-umber-800">
                                    <svg className="h-4 w-4 text-umber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="9" />
                                        <path d="m8.5 12.5 2.5 2.5 4.5-5" />
                                    </svg>
                                    {flash.success}
                                </p>
                            ) : null}
                            {flash.error ? (
                                <p className="flex items-center gap-2 text-sm font-medium text-ink-900">
                                    <svg className="h-4 w-4 text-ink-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="9" />
                                        <path d="M12 7.5v5.5M12 16.5h.01" />
                                    </svg>
                                    {flash.error}
                                </p>
                            ) : null}
                            {flash.info ? (
                                <p className="flex items-center gap-2 text-sm font-medium text-charcoal-700">
                                    <svg className="h-4 w-4 text-charcoal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="9" />
                                        <path d="M12 11v5.5M12 7.5h.01" />
                                    </svg>
                                    {flash.info}
                                </p>
                            ) : null}
                        </div>
                    </div>
                ) : null}
            </header>

            <main className="flex-1">
                {children}
            </main>

            {/* ======================================================= footer */}
            <footer className="band-dark mt-16 border-t border-ink-950/40">
                <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
                    <div className="lg:col-span-1">
                        <div className="flex items-center gap-2.5">
                            <span className="grid h-9 w-9 place-items-center rounded-lg bg-tan-400 font-display text-lg text-ink-950">
                                {brandInitial}
                            </span>
                            <span className="text-[17px] font-bold tracking-tight text-bone-100">{store.name}</span>
                        </div>
                        <p className="mt-4 max-w-xs text-sm leading-relaxed text-bone-300/80">
                            {store.tagline || store.description}
                        </p>
                        <div className="mt-5 flex items-center gap-2">
                            {Object.entries(social)
                                .filter(([, url]) => Boolean(url))
                                .map(([network, url]) => (
                                    <a
                                        key={network}
                                        href={url as string}
                                        target="_blank"
                                        rel="noopener"
                                        aria-label={network}
                                        className="grid h-9 w-9 place-items-center rounded-full border border-bone-100/20 text-bone-200 transition hover:border-tan-400 hover:bg-tan-400/15 hover:text-tan-300"
                                    >
                                        {socialIcon(network)}
                                    </a>
                                ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-tan-300">Shop</h3>
                        <ul className="mt-4 space-y-2.5 text-sm">
                            {footerShopLinks.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-bone-300/85 transition hover:text-tan-300">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-tan-300">Information</h3>
                        <ul className="mt-4 space-y-2.5 text-sm">
                            {footerPages.map((footerPage) => (
                                <li key={footerPage.slug}>
                                    <Link href={footerPage.url} className="text-bone-300/85 transition hover:text-tan-300">
                                        {footerPage.title}
                                    </Link>
                                </li>
                            ))}
                            {!footerPages.length ? (
                                <li>
                                    <Link href="/contact" className="text-bone-300/85 transition hover:text-tan-300">Contact us</Link>
                                </li>
                            ) : null}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-tan-300">Get in touch</h3>
                        <ul className="mt-4 space-y-3 text-sm text-bone-300/85">
                            {store.address ? (
                                <li className="whitespace-pre-line leading-relaxed">{store.address}</li>
                            ) : null}
                            {store.email ? (
                                <li>
                                    <a href={`mailto:${store.email}`} className="transition hover:text-tan-300">{store.email}</a>
                                </li>
                            ) : null}
                            {store.phone ? (
                                <li>
                                    <a href={`tel:${store.phone}`} className="transition hover:text-tan-300">{store.phone}</a>
                                </li>
                            ) : null}
                        </ul>
                    </div>
                </div>

                <div className="border-t border-bone-100/10">
                    <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-bone-300/60 sm:flex-row">
                        <p>&copy; {new Date().getFullYear()} {store.name}. All rights reserved.</p>
                        <p>Built for a modern shopping experience.</p>
                    </div>
                </div>
            </footer>

            {/* ================================================ mobile menu */}
            {mobileOpen ? (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)}></div>
                    <div className="absolute inset-y-0 left-0 flex w-80 max-w-[85vw] flex-col bg-canvas shadow-lift">
                        <div className="flex items-center justify-between border-b border-bone-300 px-5 py-4">
                            <span className="text-sm font-bold uppercase tracking-[0.16em] text-ink-950">Menu</span>
                            <button type="button" className="btn btn-ghost px-2 py-2" aria-label="Close menu" onClick={() => setMobileOpen(false)}>
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                    <path d="M6 6l12 12M18 6 6 18" />
                                </svg>
                            </button>
                        </div>
                        <nav className="flex-1 overflow-y-auto p-5">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="block rounded-lg px-3 py-2.5 text-base font-medium text-ink-800 transition hover:bg-bone-100"
                                >
                                    {link.label}
                                </Link>
                            ))}

                            <div className="my-4 h-px bg-bone-300"></div>

                            {auth.user ? (
                                <>
                                    {accountLinks.map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 transition hover:bg-bone-100"
                                        >
                                            {link.label}
                                        </Link>
                                    ))}
                                    {auth.user.is_admin ? (
                                        <Link
                                            href="/admin"
                                            className="mt-1 block rounded-lg px-3 py-2.5 text-sm font-semibold text-umber-700 transition hover:bg-bone-100"
                                        >
                                            Admin panel
                                        </Link>
                                    ) : null}
                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        className="mt-1 block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-ink-700 transition hover:bg-bone-100"
                                    >
                                        Sign out
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" className="btn btn-primary w-full">Sign in</Link>
                                    <Link href="/register" className="btn btn-outline mt-2 w-full">Create account</Link>
                                </>
                            )}
                        </nav>
                    </div>
                </div>
            ) : null}

            {/* ================================================ search modal */}
            {searchOpen ? (
                <div className="fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm" onClick={() => setSearchOpen(false)}></div>
                    <div className="relative container-page pt-24">
                        <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-bone-300 bg-white shadow-lift">
                            <form className="flex items-center gap-3 px-5 py-4" onSubmit={(e) => { e.preventDefault(); submitSearch(); }}>
                                <svg className="h-5 w-5 text-ink-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                    <circle cx="11" cy="11" r="6.5" />
                                    <path d="m16 16 4.5 4.5" />
                                </svg>
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    type="search"
                                    autoFocus
                                    placeholder="Search products, brands and categories..."
                                    className="w-full border-0 bg-transparent text-base text-ink-900 placeholder:text-ink-400 focus:outline-none"
                                />
                                <button type="submit" className="btn btn-primary btn-sm">Search</button>
                            </form>
                            <div className="border-t border-bone-200 bg-bone-50 px-5 py-3 text-xs text-ink-500">
                                Press <kbd className="rounded border border-bone-400 bg-white px-1.5 py-0.5 font-sans text-[10px]">Esc</kbd> to close
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}

            {/* ================================================ cart drawer */}
            {cartOpen ? (
                <div className="fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm" onClick={() => setCartOpen(false)}></div>
                    <div className="absolute inset-y-0 right-0 flex w-96 max-w-[90vw] flex-col bg-canvas shadow-lift">
                        <div className="flex items-center justify-between border-b border-bone-300 px-5 py-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold uppercase tracking-[0.16em] text-ink-950">My Cart</span>
                                <span className="badge badge-tan">{cart.items_count}</span>
                            </div>
                            <button type="button" className="btn btn-ghost px-2 py-2" aria-label="Close cart" onClick={() => setCartOpen(false)}>
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                    <path d="M6 6l12 12M18 6 6 18" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5">
                            {cart.items_count ? (
                                <>
                                    <div className="card-surface p-5">
                                        <p className="text-sm text-ink-600">You have items waiting in your cart.</p>
                                        <dl className="mt-4 space-y-2 text-sm">
                                            <div className="flex items-center justify-between">
                                                <dt className="text-ink-500">Items</dt>
                                                <dd className="font-semibold text-ink-900">{cart.items_count}</dd>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <dt className="text-ink-500">Subtotal</dt>
                                                <dd className="font-semibold text-ink-950">{cart.subtotal_formatted}</dd>
                                            </div>
                                        </dl>
                                    </div>
                                    <p className="mt-4 text-xs leading-relaxed text-ink-500">
                                        Review quantities and apply coupons on the cart page before checking out.
                                    </p>
                                </>
                            ) : (
                                <div className="grid place-items-center py-16 text-center">
                                    <span className="grid h-14 w-14 place-items-center rounded-full bg-bone-200 text-umber-600">
                                        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                                            <path d="M4 5h2l1.6 9.2a2 2 0 0 0 2 1.6h6.8a2 2 0 0 0 2-1.6L20 8H6.5" />
                                            <circle cx="10" cy="19" r="1.4" />
                                            <circle cx="17" cy="19" r="1.4" />
                                        </svg>
                                    </span>
                                    <p className="mt-4 text-sm font-medium text-ink-800">Your cart is empty</p>
                                    <p className="mt-1 text-sm text-ink-500">Add something you love to get started.</p>
                                    <Link href="/shop" className="btn btn-primary mt-5" onClick={() => setCartOpen(false)}>Browse products</Link>
                                </div>
                            )}
                        </div>

                        {cart.items_count ? (
                            <div className="border-t border-bone-300 bg-bone-50 p-5">
                                <div className="mb-4 flex items-center justify-between">
                                    <span className="text-sm font-semibold text-ink-700">Subtotal</span>
                                    <span className="text-lg font-bold text-ink-950">{cart.subtotal_formatted}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <Link href="/cart" className="btn btn-outline" onClick={() => setCartOpen(false)}>View cart</Link>
                                    <Link href="/checkout" className="btn btn-primary" onClick={() => setCartOpen(false)}>Checkout</Link>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            ) : null}
        </div>
    );
}
