import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';
import type { PageProps } from '../types';

/* `PageProps` is an interface, so it has no implicit index signature. Inertia's
   `usePage` generic is constrained to `Record<string, unknown>`, so this
   structural copy keeps every shared prop typed while satisfying it. */

const nav = [
    { label: 'Dashboard', href: '/admin', icon: 'M3 12l9-9 9 9M5 10v10h14V10' },
    { label: 'Products', href: '/admin/products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { label: 'Categories', href: '/admin/categories', icon: 'M4 6h16M4 12h16M4 18h7' },
    { label: 'Brands', href: '/admin/brands', icon: 'M12 2l3 6 6 .9-4.5 4.3L18 20l-6-3-6 3 1.5-6.8L3 8.9 9 8z' },
    { label: 'Attributes', href: '/admin/attributes', icon: 'M4 7h16M4 12h16M4 17h10' },
    { label: 'Orders', href: '/admin/orders', icon: 'M3 3h2l1 12h13l2-8H6M9 20a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z' },
    { label: 'Coupons', href: '/admin/coupons', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { label: 'Reviews', href: '/admin/reviews', icon: 'M11.05 3.7l2.1 4.25 4.7.7-3.4 3.3.8 4.65-4.2-2.2-4.2 2.2.8-4.65-3.4-3.3 4.7-.7z' },
    { label: 'Customers', href: '/admin/customers', icon: 'M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M12 12a4 4 0 100-8 4 4 0 000 8z' },
    { label: 'Pages', href: '/admin/pages', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z' },
    { label: 'Newsletter', href: '/admin/newsletter', icon: 'M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { label: 'Messages', href: '/admin/messages', icon: 'M8 10h8m-8 4h5m7 5l-4-4H6a2 2 0 01-2-2V6a2 2 0 012-2h12a2 2 0 012 2v7a2 2 0 01-2 2z' },
    { label: 'Settings', href: '/admin/settings', icon: 'M10.3 3.3a2 2 0 013.4 0M5 9a2 2 0 013.4-2M5 15a2 2 0 013.4 2M10.3 20.7a2 2 0 013.4 0' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
    const page = usePage<PageProps>();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const user = page.props.auth?.user;
    const store = page.props.store;
    const flash = page.props.flash;

    const isActive = (href: string) => {
        const url = page.url.split('?')[0];

        if (href === '/admin') {
            return url === '/admin';
        }

        return url === href || url.startsWith(`${href}/`);
    };

    return (
        <div className="min-h-screen bg-canvas">
            <aside
                className={
                    'fixed inset-y-0 left-0 z-40 flex w-64 flex-col overflow-y-auto bg-ink-950 text-bone-300 transition-transform lg:translate-x-0 ' +
                    (sidebarOpen ? 'translate-x-0' : '-translate-x-full')
                }
            >
                <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-bone-100/10 px-5">
                    <Link href="/admin" className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-tan-400 font-display text-base text-ink-950">
                            {(store.name || 'S').charAt(0)}
                        </span>
                        <span className="text-[15px] font-semibold tracking-tight text-bone-100">{store.name || 'ShopFront'}</span>
                    </Link>
                </div>

                <nav className="flex-1 space-y-0.5 px-3 py-4">
                    {nav.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ' +
                                (isActive(item.href)
                                    ? 'bg-tan-400 text-ink-950'
                                    : 'text-bone-300/80 hover:bg-bone-100/10 hover:text-bone-100')
                            }
                            onClick={() => setSidebarOpen(false)}
                        >
                            <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                            </svg>
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="border-t border-bone-100/10 px-5 py-4 text-xs text-bone-300/60">
                    <p>Signed in as</p>
                    <p className="mt-1 font-semibold text-bone-200">{user?.name}</p>
                </div>
            </aside>

            {sidebarOpen ? (
                <div className="fixed inset-0 z-30 bg-ink-950/50 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)}></div>
            ) : null}

            <div className="lg:pl-64">
                <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-bone-300 bg-canvas/85 px-4 backdrop-blur-md sm:px-6">
                    <button type="button" className="btn btn-ghost -ml-2 px-2 py-2 lg:hidden" aria-label="Open menu" onClick={() => setSidebarOpen(true)}>
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    <p className="hidden text-xs font-semibold uppercase tracking-[0.16em] text-ink-400 sm:block">Admin panel</p>

                    <div className="ml-auto flex items-center gap-3">
                        <Link href="/" className="btn btn-ghost btn-sm">View store</Link>
                        <span className="hidden h-5 w-px bg-bone-300 sm:block"></span>
                        <span className="hidden text-sm font-medium text-ink-700 sm:block">{user?.name}</span>
                        <Link href="/logout" method="post" as="button" className="btn btn-outline btn-sm">Sign out</Link>
                    </div>
                </header>

                {flash.success || flash.error || flash.info ? (
                    <div className="px-4 pt-5 sm:px-6">
                        {flash.success ? (
                            <div className="flex items-center gap-2 rounded-lg border border-umber-300 bg-bone-100 px-4 py-3 text-sm font-medium text-umber-800">
                                <svg className="h-4 w-4 text-umber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="9" />
                                    <path d="m8.5 12.5 2.5 2.5 4.5-5" />
                                </svg>
                                {flash.success}
                            </div>
                        ) : null}
                        {flash.error ? (
                            <div className="mt-2 rounded-lg border border-ink-300 bg-ink-50 px-4 py-3 text-sm font-medium text-ink-900">{flash.error}</div>
                        ) : null}
                        {flash.info ? (
                            <div className="mt-2 rounded-lg border border-charcoal-300 bg-charcoal-50 px-4 py-3 text-sm font-medium text-charcoal-800">{flash.info}</div>
                        ) : null}
                    </div>
                ) : null}

                <main className="p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
