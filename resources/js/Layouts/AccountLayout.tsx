import type { ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';
import type { PageProps } from '../types';
import StorefrontLayout from './StorefrontLayout';

/* `PageProps` is an interface, so it has no implicit index signature. Inertia's
   `usePage` generic is constrained to `Record<string, unknown>`, so this
   structural copy keeps every shared prop typed while satisfying it. */

const links = [
    { label: 'Dashboard', href: '/account' },
    { label: 'Orders', href: '/account/orders' },
    { label: 'Wishlist', href: '/account/wishlist' },
    { label: 'Addresses', href: '/account/addresses' },
    { label: 'Profile', href: '/account/profile' },
];

export default function AccountLayout({ children }: { children: ReactNode }) {
    const page = usePage<PageProps>();
    const auth = page.props.auth;

    const isActive = (href: string) => {
        const url = page.url.split('?')[0];

        if (href === '/account') {
            return url === '/account';
        }

        return url.startsWith(href);
    };

    const initials = (auth?.user?.name ?? '')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('');

    return (
        <StorefrontLayout>
            <section className="border-b border-bone-300 bg-canvas-deep">
                <div className="container-page py-10 lg:py-12">
                    <nav className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink-400">
                        <Link href="/" className="transition hover:text-umber-700">Home</Link>
                        <span className="text-bone-400">/</span>
                        <span className="text-ink-600">My account</span>
                    </nav>

                    <h1 className="title mt-4 text-3xl sm:text-4xl">My <b>account</b></h1>
                </div>
            </section>

            <div className="container-page py-10 lg:py-14">
                <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
                    <aside className="lg:sticky lg:top-24 lg:self-start">
                        <div className="card-surface p-5">
                            <div className="flex items-center gap-3">
                                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-charcoal-900 text-sm font-semibold text-bone-100">
                                    {initials || 'A'}
                                </span>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-ink-950">{auth.user?.name}</p>
                                    <p className="truncate text-xs text-ink-500">{auth.user?.email}</p>
                                </div>
                            </div>
                        </div>

                        <nav className="mt-4 space-y-1">
                            {links.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={
                                        'block rounded-lg px-4 py-2.5 text-sm font-medium transition ' +
                                        (isActive(link.href)
                                            ? 'bg-ink-950 text-bone-100 shadow-soft'
                                            : 'text-ink-600 hover:bg-bone-100 hover:text-ink-950')
                                    }
                                >
                                    {link.label}
                                </Link>
                            ))}

                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="block w-full rounded-lg px-4 py-2.5 text-left text-sm font-medium text-ink-500 transition hover:bg-bone-100 hover:text-ink-950"
                            >
                                Sign out
                            </Link>
                        </nav>
                    </aside>

                    <div className="min-w-0">
                        {children}
                    </div>
                </div>
            </div>
        </StorefrontLayout>
    );
}
