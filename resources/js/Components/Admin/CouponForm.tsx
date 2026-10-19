import { Link, useForm } from '@inertiajs/react';

interface CouponTypeOption {
    value: string | number;
    label: string;
}

interface CouponRecord {
    id?: number;
    code?: string | null;
    name?: string | null;
    description?: string | null;
    type?: string | null;
    value?: number | null;
    min_order_total?: number | string | null;
    max_discount_amount?: number | string | null;
    usage_limit?: number | string | null;
    usage_limit_per_user?: number | string | null;
    is_active?: boolean;
    starts_at?: string | null;
    expires_at?: string | null;
}

interface Props {
    coupon?: CouponRecord | null;
    types?: CouponTypeOption[];
}

export default function CouponForm({ coupon, types = [] }: Props) {
    const form = useForm({
        code: coupon?.code ?? '',
        name: coupon?.name ?? '',
        description: coupon?.description ?? '',
        type: coupon?.type ?? types[0]?.value ?? 'fixed',
        value: coupon?.value ?? 0,
        min_order_total: coupon?.min_order_total ?? '',
        max_discount_amount: coupon?.max_discount_amount ?? '',
        usage_limit: coupon?.usage_limit ?? '',
        usage_limit_per_user: coupon?.usage_limit_per_user ?? '',
        is_active: coupon?.is_active ?? true,
        starts_at: coupon?.starts_at ?? '',
        expires_at: coupon?.expires_at ?? '',
    });

    const isEditing = Boolean(coupon?.id);

    const submit = () => {
        if (isEditing) {
            form.put(`/admin/coupons/${coupon?.id}`);
        } else {
            form.post('/admin/coupons');
        }
    };

    return (
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); submit(); }}>
            <div className="card-surface p-6">
                <h2 className="text-base font-semibold text-ink-950">Coupon details</h2>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-ink-700">Code</label>
                        <input
                            value={form.data.code}
                            onChange={(e) => form.setData('code', e.target.value)}
                            type="text"
                            placeholder="SUMMER20"
                            className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm uppercase focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                        />
                        {form.errors.code ? (
                            <p className="mt-1 text-xs text-ink-700">{form.errors.code}</p>
                        ) : null}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-ink-700">Name</label>
                        <input
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            type="text"
                            className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                        />
                        {form.errors.name ? (
                            <p className="mt-1 text-xs text-ink-700">{form.errors.name}</p>
                        ) : null}
                    </div>

                    <div className="sm:col-span-2">
                        <label className="mb-1 block text-sm font-medium text-ink-700">Description</label>
                        <textarea
                            value={form.data.description}
                            onChange={(e) => form.setData('description', e.target.value)}
                            rows={3}
                            className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                        ></textarea>
                        {form.errors.description ? (
                            <p className="mt-1 text-xs text-ink-700">{form.errors.description}</p>
                        ) : null}
                    </div>
                </div>
            </div>

            <div className="card-surface p-6">
                <h2 className="text-base font-semibold text-ink-950">Discount</h2>

                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-ink-700">Type</label>
                        <select
                            value={form.data.type}
                            onChange={(e) => form.setData('type', e.target.value)}
                            className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                        >
                            {types.map((type) => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                        {form.errors.type ? (
                            <p className="mt-1 text-xs text-ink-700">{form.errors.type}</p>
                        ) : null}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-ink-700">Value</label>
                        <input
                            value={form.data.value}
                            onChange={(e) => form.setData('value', Number(e.target.value))}
                            type="number"
                            step="0.01"
                            min="0"
                            className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                        />
                        {form.errors.value ? (
                            <p className="mt-1 text-xs text-ink-700">{form.errors.value}</p>
                        ) : null}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-ink-700">Max discount <span className="text-ink-400">(optional)</span></label>
                        <input
                            value={form.data.max_discount_amount}
                            onChange={(e) => form.setData('max_discount_amount', Number(e.target.value))}
                            type="number"
                            step="0.01"
                            min="0"
                            className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                        />
                        {form.errors.max_discount_amount ? (
                            <p className="mt-1 text-xs text-ink-700">{form.errors.max_discount_amount}</p>
                        ) : null}
                    </div>
                </div>
            </div>

            <div className="card-surface p-6">
                <h2 className="text-base font-semibold text-ink-950">Conditions &amp; limits</h2>

                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-ink-700">Min order total</label>
                        <input
                            value={form.data.min_order_total}
                            onChange={(e) => form.setData('min_order_total', Number(e.target.value))}
                            type="number"
                            step="0.01"
                            min="0"
                            className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                        />
                        {form.errors.min_order_total ? (
                            <p className="mt-1 text-xs text-ink-700">{form.errors.min_order_total}</p>
                        ) : null}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-ink-700">Total usage limit</label>
                        <input
                            value={form.data.usage_limit}
                            onChange={(e) => form.setData('usage_limit', Number(e.target.value))}
                            type="number"
                            min="1"
                            className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                        />
                        {form.errors.usage_limit ? (
                            <p className="mt-1 text-xs text-ink-700">{form.errors.usage_limit}</p>
                        ) : null}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-ink-700">Limit per user</label>
                        <input
                            value={form.data.usage_limit_per_user}
                            onChange={(e) => form.setData('usage_limit_per_user', Number(e.target.value))}
                            type="number"
                            min="1"
                            className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                        />
                        {form.errors.usage_limit_per_user ? (
                            <p className="mt-1 text-xs text-ink-700">{form.errors.usage_limit_per_user}</p>
                        ) : null}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-ink-700">Starts at</label>
                        <input
                            value={form.data.starts_at}
                            onChange={(e) => form.setData('starts_at', e.target.value)}
                            type="date"
                            className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                        />
                        {form.errors.starts_at ? (
                            <p className="mt-1 text-xs text-ink-700">{form.errors.starts_at}</p>
                        ) : null}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-ink-700">Expires at</label>
                        <input
                            value={form.data.expires_at}
                            onChange={(e) => form.setData('expires_at', e.target.value)}
                            type="date"
                            className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                        />
                        {form.errors.expires_at ? (
                            <p className="mt-1 text-xs text-ink-700">{form.errors.expires_at}</p>
                        ) : null}
                    </div>

                    <div className="flex items-end">
                        <label className="flex items-center gap-2 text-sm text-ink-700">
                            <input
                                checked={form.data.is_active}
                                onChange={(e) => form.setData('is_active', e.target.checked)}
                                type="checkbox"
                                className="rounded border-bone-400 text-umber-700 focus:ring-umber-600"
                            />
                            Active
                        </label>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button type="submit" disabled={form.processing} className="btn btn-primary">
                    {isEditing ? 'Update coupon' : 'Create coupon'}
                </button>
                <Link href="/admin/coupons" className="text-sm font-medium text-ink-600 hover:text-ink-950">Cancel</Link>
            </div>
        </form>
    );
}
