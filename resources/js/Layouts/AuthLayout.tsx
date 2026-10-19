import type { ReactNode } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import type { PageProps } from '../types';

/* `PageProps` is an interface, so it has no implicit index signature. Inertia's
   `usePage` generic is constrained to `Record<string, unknown>`, so this
   structural copy keeps every shared prop typed while satisfying it. */

interface Props {
    title: string;
    children: ReactNode;
}

export default function AuthLayout({ title, children }: Props) {
    const store = usePage<PageProps>().props.store;
    const brandInitial = (store.name ?? 'S').charAt(0).toUpperCase();

    return (
        <>
            <Head title={title} />

            <div className="flex min-h-full flex-col bg-canvas">
                <header className="border-b border-bone-300">
                    <div className="container-page flex h-[68px] items-center justify-between">
                        <Link href="/" className="group flex items-center gap-3">
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-950 font-display text-lg text-tan-300">
                                {brandInitial}
                            </span>
                            <span className="text-sm font-semibold tracking-tight text-ink-950 transition group-hover:text-umber-700">
                                {store.name}
                            </span>
                        </Link>
                        <Link href="/shop" className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-500 transition hover:text-umber-700">
                            Back to shop
                        </Link>
                    </div>
                </header>

                <main className="flex flex-1 items-center justify-center px-4 py-14">
                    <div className="w-full max-w-md">
                        <div className="card-surface p-8 lg:p-10">
                            <p className="eyebrow">Account</p>
                            <h1 className="title mt-3 text-2xl">{title}</h1>
                            <div className="mt-7">
                                {children}
                            </div>
                        </div>
                    </div>
                </main>

                <footer className="border-t border-bone-300 py-6">
                    <div className="container-page flex flex-wrap items-center justify-between gap-3 text-xs text-ink-500">
                        <p>© {new Date().getFullYear()} {store.name}. All rights reserved.</p>
                        <div className="flex items-center gap-4">
                            <Link href="/page/terms-conditions" className="transition hover:text-umber-700">Terms</Link>
                            <Link href="/page/privacy-policy" className="transition hover:text-umber-700">Privacy</Link>
                            <Link href="/contact" className="transition hover:text-umber-700">Support</Link>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
