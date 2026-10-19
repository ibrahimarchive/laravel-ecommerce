import { Head, Link } from '@inertiajs/react';
import type { PageProps } from '../../types';
import StorefrontLayout from '../../Layouts/StorefrontLayout';

interface ContentPage {
    title: string;
    meta_description?: string | null;
    excerpt?: string | null;
    content: string;
}

interface Props extends PageProps {
    page: ContentPage;
}

export default function PageShow({ page }: Props) {
    return (
        <StorefrontLayout>
            <Head title={page.title}>
                {page.meta_description ? <meta name="description" content={page.meta_description} /> : null}
            </Head>

            <section className="border-b border-bone-300 bg-canvas-deep">
                <div className="container-page py-12 lg:py-16">
                    <nav className="flex items-center gap-2 text-xs text-ink-400">
                        <Link href="/" className="transition hover:text-umber-700">Home</Link>
                        <span aria-hidden="true">/</span>
                        <span className="text-ink-700">{page.title}</span>
                    </nav>

                    <p className="eyebrow mt-6">Information</p>
                    <h1 className="title mt-3 text-3xl sm:text-4xl lg:text-5xl">{page.title}</h1>
                    {page.excerpt && (
                        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-600">
                            {page.excerpt}
                        </p>
                    )}
                </div>
            </section>

            <section className="py-12 lg:py-16">
                <div className="container-page grid gap-12 lg:grid-cols-[1fr_320px]">
                    <article className="card-surface p-8 lg:p-10">
                        <div className="prose-content max-w-none" dangerouslySetInnerHTML={{ __html: page.content }} />
                    </article>

                    <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
                        <div className="panel-warm rounded-2xl border border-bone-300 p-6">
                            <p className="eyebrow">Need a hand?</p>
                            <h2 className="title mt-2 text-xl">We are happy to help</h2>
                            <p className="mt-3 text-sm leading-relaxed text-ink-600">
                                Questions about shipping, returns or an existing order? Our team replies within one business day.
                            </p>
                            <Link href="/contact" className="btn btn-outline btn-sm mt-5">Contact us</Link>
                        </div>

                        <div className="card-surface p-6">
                            <p className="eyebrow">Keep exploring</p>
                            <ul className="mt-4 space-y-3 text-sm">
                                <li>
                                    <Link href="/shop" className="text-ink-700 transition hover:text-umber-700">Browse the shop</Link>
                                </li>
                                <li>
                                    <Link href="/shop?on_sale=1" className="text-ink-700 transition hover:text-umber-700">See what is on sale</Link>
                                </li>
                                <li>
                                    <Link href="/contact" className="text-ink-700 transition hover:text-umber-700">Send us a message</Link>
                                </li>
                            </ul>
                        </div>
                    </aside>
                </div>
            </section>
        </StorefrontLayout>
    );
}
