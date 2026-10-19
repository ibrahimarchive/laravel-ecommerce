import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import type { Currency, PageProps } from '../../types';
import StorefrontLayout from '../../Layouts/StorefrontLayout';

interface CartItem {
    id: number;
    name: string;
    url: string;
    image: string;
    variant?: string | null;
    quantity: number;
    unit_price_formatted: string;
    subtotal_formatted: string;
    exceeds_stock?: boolean;
    available_stock?: number;
    price_changed?: boolean;
}

interface CartTotals {
    discount_total: number;
    [key: string]: unknown;
}

interface CartTotalsFormatted {
    subtotal: string;
    discount_total: string;
    tax_total: string;
    shipping_total: string;
    grand_total: string;
}

interface ShippingMethod {
    value: string;
    label: string;
    rate: number;
    description?: string | null;
}

interface CartCoupon {
    code: string;
    label: string;
}

interface Props extends PageProps {
    items: CartItem[];
    totals: CartTotals;
    totalsFormatted: CartTotalsFormatted;
    coupon: CartCoupon | null;
    shippingMethods: ShippingMethod[];
    shippingMethod: string | null;
}

export default function CartIndex({
    items,
    totals,
    totalsFormatted,
    coupon,
    shippingMethods,
    shippingMethod,
}: Props) {
    const { store } = usePage<PageProps>().props;

    const currency: Currency = store?.currency ?? { code: 'USD', symbol: '$', position: 'before', decimals: 2 };

    const couponForm = useForm({ coupon: coupon?.code ?? '' });

    const applyCoupon = () => {
        couponForm.post('/cart/coupon', { preserveScroll: true });
    };

    const removeCoupon = () => {
        router.delete('/cart/coupon', { preserveScroll: true });
    };

    const updateQuantity = (item: CartItem, quantity: number) => {
        if (quantity < 1) {
            return;
        }
        router.patch(`/cart/items/${item.id}`, { quantity }, { preserveScroll: true });
    };

    const removeItem = (item: CartItem) => {
        router.delete(`/cart/items/${item.id}`, { preserveScroll: true });
    };

    const clearCart = () => {
        router.delete('/cart', { preserveScroll: true });
    };

    const selectShipping = (method: string) => {
        router.patch('/cart/shipping', { shipping_method: method }, { preserveScroll: true });
    };

    const formatRate = (rate: number) => (rate > 0 ? `${currency.symbol}${Number(rate).toFixed(2)}` : 'Free');

    return (
        <StorefrontLayout>
            <Head title="Shopping cart" />

            <section className="border-b border-bone-300 bg-canvas-deep">
                <div className="container-page py-10 lg:py-12">
                    <nav className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink-400">
                        <Link href="/" className="transition hover:text-umber-700">Home</Link>
                        <span className="text-bone-400">/</span>
                        <span className="text-ink-600">Cart</span>
                    </nav>

                    <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
                        <h1 className="title text-3xl sm:text-4xl">Your <b>cart</b></h1>
                        {items.length > 0 && (
                            <p className="text-sm text-ink-500">
                                {items.length} {items.length === 1 ? 'item' : 'items'}
                            </p>
                        )}
                    </div>
                </div>
            </section>

            {items.length > 0 ? (
                <div className="container-page grid gap-10 py-10 lg:grid-cols-[1fr_380px] lg:py-14">
                    <div className="space-y-4">
                        {items.map((item) => (
                            <article key={item.id} className="card-surface flex gap-5 p-4 sm:p-5">
                                <Link href={item.url} className="h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-bone-300 bg-bone-100">
                                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                </Link>

                                <div className="flex min-w-0 flex-1 flex-col">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <Link href={item.url} className="text-[15px] font-medium text-ink-950 transition hover:text-umber-700">
                                                {item.name}
                                            </Link>
                                            {item.variant && <p className="mt-0.5 text-sm text-ink-500">{item.variant}</p>}
                                            <p className="mt-1 text-sm text-ink-500">{item.unit_price_formatted} each</p>
                                        </div>
                                        <button
                                            type="button"
                                            className="btn btn-ghost btn-sm shrink-0 !px-2"
                                            aria-label="Remove item"
                                            onClick={() => removeItem(item)}
                                        >
                                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                                                <path d="M6 6l12 12M18 6 6 18" />
                                            </svg>
                                        </button>
                                    </div>

                                    {item.exceeds_stock ? (
                                        <p className="mt-2 text-xs font-medium text-ink-800">
                                            Only {item.available_stock} left in stock — please lower the quantity.
                                        </p>
                                    ) : item.price_changed ? (
                                        <p className="mt-2 text-xs font-medium text-umber-700">
                                            Price has changed since you added this item.
                                        </p>
                                    ) : null}

                                    <div className="mt-auto flex items-center justify-between pt-4">
                                        <div className="flex items-center rounded-lg border border-bone-400 bg-bone-50">
                                            <button
                                                type="button"
                                                className="h-9 w-9 text-ink-600 transition hover:text-ink-950"
                                                aria-label="Decrease quantity"
                                                onClick={() => updateQuantity(item, item.quantity - 1)}
                                            >
                                                −
                                            </button>
                                            <span className="w-10 text-center text-sm font-semibold text-ink-900">{item.quantity}</span>
                                            <button
                                                type="button"
                                                className="h-9 w-9 text-ink-600 transition hover:text-ink-950"
                                                aria-label="Increase quantity"
                                                onClick={() => updateQuantity(item, item.quantity + 1)}
                                            >
                                                +
                                            </button>
                                        </div>
                                        <span className="font-display text-lg text-ink-950">{item.subtotal_formatted}</span>
                                    </div>
                                </div>
                            </article>
                        ))}

                        <div className="flex items-center justify-between pt-2">
                            <Link href="/shop" className="text-sm font-semibold text-umber-700 transition hover:text-umber-600">
                                ← Continue shopping
                            </Link>
                            <button type="button" className="btn btn-ghost btn-sm" onClick={clearCart}>Clear cart</button>
                        </div>
                    </div>

                    <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
                        <div className="card-surface p-6">
                            <p className="eyebrow">Summary</p>
                            <h2 className="title mt-2 text-xl">Order summary</h2>

                            <dl className="mt-5 space-y-2.5 border-t border-bone-200 pt-5 text-sm">
                                <div className="flex justify-between">
                                    <dt className="text-ink-500">Subtotal</dt>
                                    <dd className="font-medium text-ink-900">{totalsFormatted.subtotal}</dd>
                                </div>
                                {totals.discount_total > 0 && (
                                    <div className="flex justify-between">
                                        <dt className="text-umber-700">Discount</dt>
                                        <dd className="font-medium text-umber-700">−{totalsFormatted.discount_total}</dd>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <dt className="text-ink-500">Tax</dt>
                                    <dd className="font-medium text-ink-900">{totalsFormatted.tax_total}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-ink-500">Shipping</dt>
                                    <dd className="font-medium text-ink-900">{totalsFormatted.shipping_total}</dd>
                                </div>
                                <div className="flex items-baseline justify-between border-t border-bone-300 pt-4">
                                    <dt className="font-semibold text-ink-950">Total</dt>
                                    <dd className="font-display text-2xl text-ink-950">{totalsFormatted.grand_total}</dd>
                                </div>
                            </dl>

                            <Link href="/checkout" className="btn btn-primary mt-6 w-full">Proceed to checkout</Link>
                        </div>

                        <div className="card-surface p-6">
                            <h2 className="eyebrow">Coupon code</h2>

                            {coupon ? (
                                <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-tan-300 bg-bone-100 px-3 py-2.5">
                                    <div>
                                        <p className="text-sm font-semibold text-umber-800">{coupon.code}</p>
                                        <p className="text-xs text-umber-600">{coupon.label} applied</p>
                                    </div>
                                    <button type="button" className="btn btn-ghost btn-sm" onClick={removeCoupon}>Remove</button>
                                </div>
                            ) : (
                                <form
                                    className="mt-4 flex gap-2"
                                    onSubmit={(event) => {
                                        event.preventDefault();
                                        applyCoupon();
                                    }}
                                >
                                    <input
                                        value={couponForm.data.coupon}
                                        onChange={(event) => couponForm.setData('coupon', event.target.value)}
                                        type="text"
                                        placeholder="Enter code"
                                        className="input uppercase"
                                    />
                                    <button type="submit" className="btn btn-outline btn-sm shrink-0" disabled={couponForm.processing}>
                                        Apply
                                    </button>
                                </form>
                            )}

                            {couponForm.errors.coupon && (
                                <p className="mt-2 text-xs text-ink-700">{couponForm.errors.coupon}</p>
                            )}
                        </div>

                        {shippingMethods.length > 0 && (
                            <div className="card-surface p-6">
                                <h2 className="eyebrow">Shipping method</h2>
                                <div className="mt-4 space-y-2">
                                    {shippingMethods.map((method) => (
                                        <label
                                            key={method.value}
                                            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition ${shippingMethod === method.value ? 'border-tan-400 bg-bone-100' : 'border-bone-300 hover:border-tan-400'}`}
                                        >
                                            <input
                                                type="radio"
                                                name="shipping_method"
                                                value={method.value}
                                                checked={shippingMethod === method.value}
                                                className="mt-1 h-4 w-4 border-bone-400 text-umber-700 focus:ring-tan-400"
                                                onChange={() => selectShipping(method.value)}
                                            />
                                            <span className="flex-1">
                                                <span className="flex justify-between font-medium text-ink-900">
                                                    <span>{method.label}</span>
                                                    <span>{formatRate(method.rate)}</span>
                                                </span>
                                                <span className="mt-0.5 block text-xs text-ink-500">{method.description}</span>
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </aside>
                </div>
            ) : (
                <div className="container-page py-16 lg:py-24">
                    <div className="mx-auto grid max-w-xl place-items-center rounded-2xl border border-dashed border-bone-400 bg-canvas-deep px-6 py-20 text-center">
                        <span className="grid h-16 w-16 place-items-center rounded-full bg-bone-200 text-umber-600">
                            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                                <path d="M4 5h2l1.6 9.2a2 2 0 0 0 2 1.6h6.8a2 2 0 0 0 2-1.6L20 8H6.5" />
                                <circle cx="10" cy="19" r="1.4" />
                                <circle cx="17" cy="19" r="1.4" />
                            </svg>
                        </span>
                        <h2 className="title mt-6 text-2xl">Your cart is <b>empty</b></h2>
                        <p className="mt-2 max-w-sm text-sm text-ink-500">Browse our products and add something you love.</p>
                        <Link href="/shop" className="btn btn-primary mt-7">Start shopping</Link>
                    </div>
                </div>
            )}
        </StorefrontLayout>
    );
}
