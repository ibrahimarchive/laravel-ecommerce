import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import type { PageProps } from '../../types';
import StorefrontLayout from '../../Layouts/StorefrontLayout';

interface CheckoutItem {
    id: number;
    name: string;
    variant?: string | null;
    quantity: number;
    subtotal_formatted: string;
}

interface CheckoutTotals {
    discount_total: number;
    [key: string]: unknown;
}

interface CheckoutTotalsFormatted {
    subtotal: string;
    discount_total: string;
    tax_total: string;
    shipping_total: string;
    grand_total: string;
    symbol?: string | null;
}

interface Address {
    id: number;
    label?: string | null;
    is_default?: boolean;
    one_liner: string;
}

interface ShippingMethod {
    value: string;
    label: string;
    rate: number | string;
    rate_formatted?: string | null;
    description?: string | null;
}

interface PaymentMethod {
    value: string;
    label: string;
}

interface CheckoutDefaults {
    customer_name?: string | null;
    customer_email?: string | null;
    customer_phone?: string | null;
}

interface Props extends PageProps {
    items: CheckoutItem[];
    totals: CheckoutTotals;
    totalsFormatted: CheckoutTotalsFormatted;
    addresses: Address[];
    shippingMethods: ShippingMethod[];
    shippingMethod: string | null;
    paymentMethods: PaymentMethod[];
    defaults: CheckoutDefaults;
    allowGuestCheckout: boolean;
}

interface CheckoutForm {
    address_id: number | null;
    first_name: string;
    last_name: string;
    address_line_1: string;
    address_line_2: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    shipping_method: string;
    payment_method: string;
    customer_note: string;
}

export default function CheckoutIndex({
    items,
    totals,
    totalsFormatted,
    addresses,
    shippingMethods,
    shippingMethod,
    paymentMethods,
    defaults,
    allowGuestCheckout,
}: Props) {
    const defaultAddressId: number | null =
        addresses.find((address) => address.is_default)?.id ?? addresses[0]?.id ?? null;

    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(defaultAddressId);
    const [useNewAddress, setUseNewAddress] = useState(addresses.length === 0);

    const form = useForm<CheckoutForm>({
        address_id: defaultAddressId,
        first_name: '',
        last_name: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'US',
        phone: '',
        customer_name: defaults?.customer_name ?? '',
        customer_email: defaults?.customer_email ?? '',
        customer_phone: defaults?.customer_phone ?? '',
        shipping_method: shippingMethod ?? shippingMethods[0]?.value ?? 'standard',
        payment_method: paymentMethods[0]?.value ?? 'cod',
        customer_note: '',
    });

    const selectedAddress = addresses.find((address) => address.id === selectedAddressId) ?? null;

    const chooseAddress = (id: number) => {
        setSelectedAddressId(id);
        setUseNewAddress(false);
        form.setData('address_id', id);
    };

    const chooseNewAddress = () => {
        setUseNewAddress(true);
        form.setData('address_id', null);
    };

    const submit = () => {
        form.post('/checkout', { preserveScroll: true });
    };

    return (
        <StorefrontLayout>
            <Head title="Checkout" />

            <section className="border-b border-bone-300 bg-canvas-deep">
                <div className="container-page py-10 lg:py-12">
                    <nav className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink-400">
                        <Link href="/" className="transition hover:text-umber-700">Home</Link>
                        <span className="text-bone-400">/</span>
                        <Link href="/cart" className="transition hover:text-umber-700">Cart</Link>
                        <span className="text-bone-400">/</span>
                        <span className="text-ink-600">Checkout</span>
                    </nav>

                    <h1 className="title mt-4 text-3xl sm:text-4xl">Check<b>out</b></h1>
                    <p className="mt-2 text-sm text-ink-500">Complete your details below — it only takes a minute.</p>
                </div>
            </section>

            <form
                className="container-page grid gap-10 py-10 lg:grid-cols-[1fr_380px] lg:py-14"
                onSubmit={(event) => {
                    event.preventDefault();
                    submit();
                }}
            >
                <div className="space-y-6">
                    {/* Contact */}
                    <section className="card-surface p-6 sm:p-7">
                        <h2 className="title text-lg">Contact details</h2>

                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="label" htmlFor="customer_name">Full name</label>
                                <input id="customer_name" value={form.data.customer_name} onChange={(event) => form.setData('customer_name', event.target.value)} type="text" className="input" />
                                {form.errors.customer_name && <p className="mt-1 text-xs text-ink-700">{form.errors.customer_name}</p>}
                            </div>
                            <div>
                                <label className="label" htmlFor="customer_email">Email address</label>
                                <input id="customer_email" value={form.data.customer_email} onChange={(event) => form.setData('customer_email', event.target.value)} type="email" className="input" />
                                {form.errors.customer_email && <p className="mt-1 text-xs text-ink-700">{form.errors.customer_email}</p>}
                            </div>
                            <div className="sm:col-span-2">
                                <label className="label" htmlFor="customer_phone">Phone <span className="font-normal text-ink-400">(optional)</span></label>
                                <input id="customer_phone" value={form.data.customer_phone} onChange={(event) => form.setData('customer_phone', event.target.value)} type="text" className="input" />
                                {form.errors.customer_phone && <p className="mt-1 text-xs text-ink-700">{form.errors.customer_phone}</p>}
                            </div>
                        </div>

                        {!allowGuestCheckout && (
                            <p className="mt-4 rounded-lg border border-tan-300 bg-bone-100 px-3 py-2 text-xs text-umber-700">
                                You need an account to check out. Please sign in and try again.
                            </p>
                        )}
                    </section>

                    {/* Shipping address */}
                    <section className="card-surface p-6 sm:p-7">
                        <h2 className="title text-lg">Shipping address</h2>

                        {addresses.length > 0 && (
                            <div className="mt-5 space-y-3">
                                {addresses.map((address) => (
                                    <label
                                        key={address.id}
                                        className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${selectedAddressId === address.id && !useNewAddress ? 'border-tan-400 bg-bone-100' : 'border-bone-300 hover:border-tan-400'}`}
                                    >
                                        <input
                                            type="radio"
                                            name="shipping_address"
                                            value={address.id}
                                            checked={selectedAddressId === address.id && !useNewAddress}
                                            className="mt-1 h-4 w-4 border-bone-400 text-umber-700 focus:ring-tan-400"
                                            onChange={() => chooseAddress(address.id)}
                                        />
                                        <span className="min-w-0 flex-1">
                                            <span className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-ink-950">{address.label || 'Address'}</span>
                                                {address.is_default && <span className="badge badge-tan">Default</span>}
                                            </span>
                                            <span className="mt-1 block text-sm text-ink-500">{address.one_liner}</span>
                                        </span>
                                    </label>
                                ))}

                                <label
                                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 text-sm font-medium text-ink-800 transition ${useNewAddress ? 'border-tan-400 bg-bone-100' : 'border-bone-300 hover:border-tan-400'}`}
                                >
                                    <input
                                        type="radio"
                                        name="shipping_address"
                                        checked={useNewAddress}
                                        className="h-4 w-4 border-bone-400 text-umber-700 focus:ring-tan-400"
                                        onChange={chooseNewAddress}
                                    />
                                    Use a new address
                                </label>
                            </div>
                        )}

                        {useNewAddress ? (
                            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="label" htmlFor="first_name">First name</label>
                                    <input id="first_name" value={form.data.first_name} onChange={(event) => form.setData('first_name', event.target.value)} type="text" className="input" />
                                    {form.errors.first_name && <p className="mt-1 text-xs text-ink-700">{form.errors.first_name}</p>}
                                </div>
                                <div>
                                    <label className="label" htmlFor="last_name">Last name</label>
                                    <input id="last_name" value={form.data.last_name} onChange={(event) => form.setData('last_name', event.target.value)} type="text" className="input" />
                                    {form.errors.last_name && <p className="mt-1 text-xs text-ink-700">{form.errors.last_name}</p>}
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="label" htmlFor="address_line_1">Address</label>
                                    <input id="address_line_1" value={form.data.address_line_1} onChange={(event) => form.setData('address_line_1', event.target.value)} type="text" className="input" />
                                    {form.errors.address_line_1 && <p className="mt-1 text-xs text-ink-700">{form.errors.address_line_1}</p>}
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="label" htmlFor="address_line_2">Apartment, suite, etc. <span className="font-normal text-ink-400">(optional)</span></label>
                                    <input id="address_line_2" value={form.data.address_line_2} onChange={(event) => form.setData('address_line_2', event.target.value)} type="text" className="input" />
                                    {form.errors.address_line_2 && <p className="mt-1 text-xs text-ink-700">{form.errors.address_line_2}</p>}
                                </div>
                                <div>
                                    <label className="label" htmlFor="city">City</label>
                                    <input id="city" value={form.data.city} onChange={(event) => form.setData('city', event.target.value)} type="text" className="input" />
                                    {form.errors.city && <p className="mt-1 text-xs text-ink-700">{form.errors.city}</p>}
                                </div>
                                <div>
                                    <label className="label" htmlFor="state">State / Province</label>
                                    <input id="state" value={form.data.state} onChange={(event) => form.setData('state', event.target.value)} type="text" className="input" />
                                    {form.errors.state && <p className="mt-1 text-xs text-ink-700">{form.errors.state}</p>}
                                </div>
                                <div>
                                    <label className="label" htmlFor="postal_code">Postal code</label>
                                    <input id="postal_code" value={form.data.postal_code} onChange={(event) => form.setData('postal_code', event.target.value)} type="text" className="input" />
                                    {form.errors.postal_code && <p className="mt-1 text-xs text-ink-700">{form.errors.postal_code}</p>}
                                </div>
                                <div>
                                    <label className="label" htmlFor="country">Country</label>
                                    <input id="country" value={form.data.country} onChange={(event) => form.setData('country', event.target.value)} type="text" maxLength={2} className="input uppercase" />
                                    {form.errors.country && <p className="mt-1 text-xs text-ink-700">{form.errors.country}</p>}
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="label" htmlFor="phone">Phone</label>
                                    <input id="phone" value={form.data.phone} onChange={(event) => form.setData('phone', event.target.value)} type="text" className="input" />
                                    {form.errors.phone && <p className="mt-1 text-xs text-ink-700">{form.errors.phone}</p>}
                                </div>
                            </div>
                        ) : selectedAddress ? (
                            <p className="mt-4 text-xs text-ink-500">
                                Shipping to {selectedAddress.one_liner}
                            </p>
                        ) : null}
                    </section>

                    {/* Shipping method */}
                    {shippingMethods.length > 0 && (
                        <section className="card-surface p-6 sm:p-7">
                            <h2 className="title text-lg">Shipping method</h2>

                            <div className="mt-5 space-y-3">
                                {shippingMethods.map((method) => (
                                    <label
                                        key={method.value}
                                        className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${form.data.shipping_method === method.value ? 'border-tan-400 bg-bone-100' : 'border-bone-300 hover:border-tan-400'}`}
                                    >
                                        <input
                                            type="radio"
                                            name="shipping_method"
                                            value={method.value}
                                            checked={form.data.shipping_method === method.value}
                                            className="mt-1 h-4 w-4 border-bone-400 text-umber-700 focus:ring-tan-400"
                                            onChange={() => form.setData('shipping_method', method.value)}
                                        />
                                        <span className="min-w-0 flex-1">
                                            <span className="flex items-center justify-between gap-4">
                                                <span className="text-sm font-semibold text-ink-950">{method.label}</span>
                                                <span className="text-sm font-medium text-ink-700">
                                                    {Number(method.rate) > 0 ? `${totalsFormatted.symbol ?? ''}` : ''}{method.rate_formatted ?? method.rate}
                                                </span>
                                            </span>
                                            {method.description && <span className="mt-1 block text-sm text-ink-500">{method.description}</span>}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Payment method */}
                    {paymentMethods.length > 0 && (
                        <section className="card-surface p-6 sm:p-7">
                            <h2 className="title text-lg">Payment method</h2>

                            <div className="mt-5 space-y-3">
                                {paymentMethods.map((method) => (
                                    <label
                                        key={method.value}
                                        className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition ${form.data.payment_method === method.value ? 'border-tan-400 bg-bone-100' : 'border-bone-300 hover:border-tan-400'}`}
                                    >
                                        <input
                                            type="radio"
                                            name="payment_method"
                                            value={method.value}
                                            checked={form.data.payment_method === method.value}
                                            className="h-4 w-4 border-bone-400 text-umber-700 focus:ring-tan-400"
                                            onChange={() => form.setData('payment_method', method.value)}
                                        />
                                        <span className="text-sm font-semibold text-ink-950">{method.label}</span>
                                    </label>
                                ))}
                            </div>

                            {form.errors.payment_method && (
                                <p className="mt-3 text-xs text-ink-700">{form.errors.payment_method}</p>
                            )}
                        </section>
                    )}

                    {/* Note */}
                    <section className="card-surface p-6 sm:p-7">
                        <h2 className="title text-lg">Order note <span className="text-sm font-normal text-ink-400">(optional)</span></h2>
                        <textarea value={form.data.customer_note} onChange={(event) => form.setData('customer_note', event.target.value)} rows={3} className="textarea mt-4" placeholder="Delivery instructions, gift message, anything else..."></textarea>
                    </section>
                </div>

                {/* Summary */}
                <aside className="lg:sticky lg:top-24 lg:self-start">
                    <div className="card-surface p-6">
                        <p className="eyebrow">Summary</p>
                        <h2 className="title mt-2 text-xl">Your order</h2>

                        <ul className="mt-5 divide-y divide-bone-200 border-y border-bone-200">
                            {items.map((item) => (
                                <li key={item.id} className="flex items-start justify-between gap-4 py-3">
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-ink-900">{item.name}</p>
                                        {item.variant && <p className="text-xs text-ink-500">{item.variant}</p>}
                                        <p className="text-xs text-ink-500">Qty {item.quantity}</p>
                                    </div>
                                    <span className="shrink-0 text-sm font-medium text-ink-900">{item.subtotal_formatted}</span>
                                </li>
                            ))}
                        </ul>

                        <dl className="mt-5 space-y-2.5 text-sm">
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

                        <button
                            type="submit"
                            className="btn btn-primary mt-6 w-full"
                            disabled={form.processing || !allowGuestCheckout}
                        >
                            {form.processing ? 'Placing order...' : 'Place order'}
                        </button>

                        <p className="mt-4 text-xs leading-relaxed text-ink-500">
                            By placing your order you agree to our terms of service and privacy policy.
                        </p>

                        <Link href="/cart" className="mt-4 block text-center text-xs font-semibold text-umber-700 transition hover:text-umber-600">
                            ← Back to cart
                        </Link>
                    </div>
                </aside>
            </form>
        </StorefrontLayout>
    );
}
