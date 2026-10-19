import { Head, useForm, usePage } from '@inertiajs/react';
import type { PageProps } from '../types';
import StorefrontLayout from '../Layouts/StorefrontLayout';

export default function Contact(_props: PageProps) {
    const { store } = usePage<PageProps>().props;

    const form = useForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    });

    function submit() {
        form.post('/contact', {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    }

    return (
        <StorefrontLayout>
            <Head title="Contact us" />

            <section className="border-b border-bone-300 bg-canvas-deep">
                <div className="container-page py-12 lg:py-16">
                    <p className="eyebrow">Get in touch</p>
                    <h1 className="title mt-3 text-3xl sm:text-4xl lg:text-5xl">Talk to <b>us</b></h1>
                    <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-600">
                        Questions about an order, a product or a return? Send a note and we will get back to you within one business day.
                    </p>
                </div>
            </section>

            <section className="py-12 lg:py-16">
                <div className="container-page grid gap-10 lg:grid-cols-[1fr_360px]">
                    <form
                        className="card-surface p-8 lg:p-10"
                        onSubmit={(event) => {
                            event.preventDefault();
                            submit();
                        }}
                    >
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                                <label className="label" htmlFor="name">Name</label>
                                <input id="name" value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} type="text" className="input mt-2" placeholder="Your full name" />
                                {form.errors.name && <p className="mt-1 text-xs text-ink-700">{form.errors.name}</p>}
                            </div>
                            <div>
                                <label className="label" htmlFor="email">Email</label>
                                <input id="email" value={form.data.email} onChange={(event) => form.setData('email', event.target.value)} type="email" className="input mt-2" placeholder="you@example.com" />
                                {form.errors.email && <p className="mt-1 text-xs text-ink-700">{form.errors.email}</p>}
                            </div>
                            <div>
                                <label className="label" htmlFor="phone">Phone <span className="text-ink-400">(optional)</span></label>
                                <input id="phone" value={form.data.phone} onChange={(event) => form.setData('phone', event.target.value)} type="text" className="input mt-2" placeholder="+1 555 000 0000" />
                                {form.errors.phone && <p className="mt-1 text-xs text-ink-700">{form.errors.phone}</p>}
                            </div>
                            <div>
                                <label className="label" htmlFor="subject">Subject</label>
                                <input id="subject" value={form.data.subject} onChange={(event) => form.setData('subject', event.target.value)} type="text" className="input mt-2" placeholder="How can we help?" />
                                {form.errors.subject && <p className="mt-1 text-xs text-ink-700">{form.errors.subject}</p>}
                            </div>
                        </div>

                        <div className="mt-6">
                            <label className="label" htmlFor="message">Message</label>
                            <textarea id="message" value={form.data.message} onChange={(event) => form.setData('message', event.target.value)} rows={6} className="textarea mt-2" placeholder="Tell us a little more..." />
                            {form.errors.message && <p className="mt-1 text-xs text-ink-700">{form.errors.message}</p>}
                        </div>

                        <div className="mt-8 flex items-center gap-4">
                            <button type="submit" className="btn btn-primary" disabled={form.processing}>
                                {form.processing ? 'Sending...' : 'Send message'}
                            </button>
                            <span className="text-xs text-ink-500">We never share your details.</span>
                        </div>
                    </form>

                    <aside className="space-y-6">
                        <div className="band-dark rounded-2xl p-7">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-tan-400">Store details</p>
                            <dl className="mt-5 space-y-4 text-sm">
                                {store?.address && (
                                    <div>
                                        <dt className="text-bone-100/60">Address</dt>
                                        <dd className="mt-1 whitespace-pre-line text-bone-100">{store.address}</dd>
                                    </div>
                                )}
                                {store?.email && (
                                    <div>
                                        <dt className="text-bone-100/60">Email</dt>
                                        <dd className="mt-1">
                                            <a href={`mailto:${store.email}`} className="text-tan-300 transition hover:text-tan-400">{store.email}</a>
                                        </dd>
                                    </div>
                                )}
                                {store?.phone && (
                                    <div>
                                        <dt className="text-bone-100/60">Phone</dt>
                                        <dd className="mt-1">
                                            <a href={`tel:${store.phone}`} className="text-tan-300 transition hover:text-tan-400">{store.phone}</a>
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        </div>

                        <div className="card-surface p-6">
                            <p className="eyebrow">Response time</p>
                            <p className="mt-3 text-sm leading-relaxed text-ink-600">
                                Messages sent during business hours are usually answered the same day, and always within one business day.
                            </p>
                        </div>
                    </aside>
                </div>
            </section>
        </StorefrontLayout>
    );
}
