import { Head, Link } from '@inertiajs/react';
import type { PageProps } from '../../types';
import StorefrontLayout from '../../Layouts/StorefrontLayout';

interface CancelledOrder {
    number: string;
}

interface Props extends PageProps {
    order: CancelledOrder | null;
}

export default function CheckoutCancel({ order }: Props) {
    return (
        <StorefrontLayout>
            <Head title="Payment cancelled" />

            <div className="container-page py-16 lg:py-24">
                <div className="mx-auto max-w-2xl">
                    <div className="card-surface p-8 text-center sm:p-10">
                        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-tan-400/25 text-umber-700">
                            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 8v5m0 3.5h.01" strokeLinecap="round" />
                                <circle cx="12" cy="12" r="9" />
                            </svg>
                        </span>

                        <p className="eyebrow mt-6">Checkout</p>
                        <h1 className="title mt-2 text-3xl sm:text-4xl">Payment was <b>cancelled</b></h1>

                        <p className="mt-4 text-sm leading-relaxed text-ink-600">
                            No money has left your account. Your cart is exactly as you left it, so you can pick up
                            right where you stopped.
                        </p>

                        {order && (
                            <p className="mx-auto mt-5 inline-flex items-center gap-2 rounded-lg border border-bone-300 bg-canvas-deep px-4 py-2.5 text-sm text-ink-700">
                                <span className="text-ink-500">Order</span>
                                <span className="font-display text-base text-ink-950">{order.number}</span>
                            </p>
                        )}

                        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                            <Link href="/cart" className="btn btn-primary">Return to cart</Link>
                            <Link href="/contact" className="btn btn-outline">Contact support</Link>
                        </div>
                    </div>
                </div>
            </div>
        </StorefrontLayout>
    );
}
