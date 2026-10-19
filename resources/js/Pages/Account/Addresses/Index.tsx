import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AccountLayout from '../../../Layouts/AccountLayout';

interface Address {
    id: number;
    label?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    company?: string | null;
    address_line_1?: string | null;
    address_line_2?: string | null;
    city?: string | null;
    state?: string | null;
    postal_code?: string | null;
    country?: string | null;
    phone?: string | null;
    is_default?: boolean;
    one_liner: string;
}

interface AddressFormData {
    label: string;
    first_name: string;
    last_name: string;
    company: string;
    address_line_1: string;
    address_line_2: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone: string;
    is_default: boolean;
}

interface Props {
    addresses?: Address[];
}

export default function AddressesIndex({ addresses = [] }: Props) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [showForm, setShowForm] = useState(false);

    const blank: AddressFormData = {
        label: '',
        first_name: '',
        last_name: '',
        company: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'US',
        phone: '',
        is_default: false,
    };

    const form = useForm({ ...blank });

    const openCreate = () => {
        setEditingId(null);
        form.reset();
        form.clearErrors();
        setShowForm(true);
    };

    const openEdit = (address: Address) => {
        setEditingId(address.id);
        form.clearErrors();
        form.setData({
            label: address.label ?? '',
            first_name: address.first_name ?? '',
            last_name: address.last_name ?? '',
            company: address.company ?? '',
            address_line_1: address.address_line_1 ?? '',
            address_line_2: address.address_line_2 ?? '',
            city: address.city ?? '',
            state: address.state ?? '',
            postal_code: address.postal_code ?? '',
            country: address.country ?? 'US',
            phone: address.phone ?? '',
            is_default: !!address.is_default,
        });
        setShowForm(true);
    };

    const close = () => {
        setShowForm(false);
        setEditingId(null);
        form.reset();
        form.clearErrors();
    };

    const submit = () => {
        if (editingId) {
            form.put(`/account/addresses/${editingId}`, {
                preserveScroll: true,
                onSuccess: () => close(),
            });
        } else {
            form.post('/account/addresses', {
                preserveScroll: true,
                onSuccess: () => close(),
            });
        }
    };

    const destroy = (address: Address) => {
        if (confirm('Delete this address?')) {
            router.delete(`/account/addresses/${address.id}`, { preserveScroll: true });
        }
    };

    const makeDefault = (address: Address) => {
        router.patch(`/account/addresses/${address.id}/default`, {}, { preserveScroll: true });
    };

    return (
        <AccountLayout>
            <Head title="My addresses" />

            <div className="flex items-center justify-between">
                <h1 className="title text-2xl">Addresses</h1>
                <button type="button" onClick={openCreate} className="btn btn-primary btn-sm">
                    Add address
                </button>
            </div>

            {addresses.length ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {addresses.map((address) => (
                        <div key={address.id} className="card-surface p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="font-semibold text-ink-950">{address.label || 'Address'}</p>
                                    {address.is_default && (
                                        <span className="mt-1 inline-block rounded-full bg-bone-100 px-2 py-0.5 text-xs font-semibold text-ink-900">Default</span>
                                    )}
                                </div>
                            </div>
                            <p className="mt-3 text-sm leading-relaxed text-ink-600">{address.one_liner}</p>
                            <div className="mt-4 flex gap-3 text-sm font-semibold">
                                <button type="button" onClick={() => openEdit(address)} className="text-umber-700 hover:text-umber-600">Edit</button>
                                {!address.is_default && (
                                    <button type="button" onClick={() => makeDefault(address)} className="text-ink-600 hover:text-ink-950">Make default</button>
                                )}
                                <button type="button" onClick={() => destroy(address)} className="text-ink-700 hover:text-ink-600">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="mt-6 rounded-xl border border-dashed border-bone-400 bg-canvas-deep px-5 py-12 text-center text-sm text-ink-500">
                    You haven't saved any addresses yet.
                </p>
            )}

            {showForm && (
                <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-ink-950/50 p-4 py-10">
                    <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
                        <h2 className="text-lg font-semibold text-ink-950">{editingId ? 'Edit address' : 'New address'}</h2>

                        <form className="mt-5 grid grid-cols-2 gap-4" onSubmit={(e) => { e.preventDefault(); submit(); }}>
                            <div className="col-span-2 sm:col-span-1">
                                <label className="mb-1 block text-sm font-medium text-ink-700">Label</label>
                                <input value={form.data.label} onChange={(e) => form.setData('label', e.target.value)} type="text" placeholder="Home, Work..." className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600" />
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <label className="mb-1 block text-sm font-medium text-ink-700">Phone</label>
                                <input value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} type="text" className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600" />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-ink-700">First name</label>
                                <input value={form.data.first_name} onChange={(e) => form.setData('first_name', e.target.value)} type="text" className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600" />
                                {form.errors.first_name && <p className="mt-1 text-xs text-ink-700">{form.errors.first_name}</p>}
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-ink-700">Last name</label>
                                <input value={form.data.last_name} onChange={(e) => form.setData('last_name', e.target.value)} type="text" className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600" />
                                {form.errors.last_name && <p className="mt-1 text-xs text-ink-700">{form.errors.last_name}</p>}
                            </div>
                            <div className="col-span-2">
                                <label className="mb-1 block text-sm font-medium text-ink-700">Company <span className="text-ink-400">(optional)</span></label>
                                <input value={form.data.company} onChange={(e) => form.setData('company', e.target.value)} type="text" className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600" />
                            </div>
                            <div className="col-span-2">
                                <label className="mb-1 block text-sm font-medium text-ink-700">Address line 1</label>
                                <input value={form.data.address_line_1} onChange={(e) => form.setData('address_line_1', e.target.value)} type="text" className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600" />
                                {form.errors.address_line_1 && <p className="mt-1 text-xs text-ink-700">{form.errors.address_line_1}</p>}
                            </div>
                            <div className="col-span-2">
                                <label className="mb-1 block text-sm font-medium text-ink-700">Address line 2 <span className="text-ink-400">(optional)</span></label>
                                <input value={form.data.address_line_2} onChange={(e) => form.setData('address_line_2', e.target.value)} type="text" className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600" />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-ink-700">City</label>
                                <input value={form.data.city} onChange={(e) => form.setData('city', e.target.value)} type="text" className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600" />
                                {form.errors.city && <p className="mt-1 text-xs text-ink-700">{form.errors.city}</p>}
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-ink-700">State / Province</label>
                                <input value={form.data.state} onChange={(e) => form.setData('state', e.target.value)} type="text" className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600" />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-ink-700">Postal code</label>
                                <input value={form.data.postal_code} onChange={(e) => form.setData('postal_code', e.target.value)} type="text" className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600" />
                                {form.errors.postal_code && <p className="mt-1 text-xs text-ink-700">{form.errors.postal_code}</p>}
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-ink-700">Country</label>
                                <input value={form.data.country} onChange={(e) => form.setData('country', e.target.value)} type="text" maxLength={2} className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm uppercase focus:border-umber-600 focus:ring-1 focus:ring-umber-600" />
                                {form.errors.country && <p className="mt-1 text-xs text-ink-700">{form.errors.country}</p>}
                            </div>
                            <label className="col-span-2 flex items-center gap-2 text-sm text-ink-700">
                                <input checked={form.data.is_default} onChange={(e) => form.setData('is_default', e.target.checked)} type="checkbox" className="rounded border-bone-400 text-umber-700 focus:ring-umber-600" />
                                Set as default address
                            </label>

                            <div className="col-span-2 flex justify-end gap-3 border-t border-bone-300 pt-4">
                                <button type="button" onClick={close} className="rounded-lg border border-bone-400 px-4 py-2 text-sm font-semibold text-ink-700 hover:bg-bone-50">Cancel</button>
                                <button type="submit" disabled={form.processing} className="btn btn-primary btn-sm">
                                    {editingId ? 'Save changes' : 'Add address'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AccountLayout>
    );
}
