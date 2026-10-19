import { Link, useForm } from '@inertiajs/react';

interface BrandRecord {
    id?: number;
    name?: string | null;
    slug?: string | null;
    description?: string | null;
    logo?: string | null;
    website?: string | null;
    is_active?: boolean;
    is_featured?: boolean;
    sort_order?: number | null;
}

interface Props {
    brand?: BrandRecord | null;
}

export default function BrandForm({ brand }: Props) {
    const form = useForm({
        name: brand?.name ?? '',
        slug: brand?.slug ?? '',
        description: brand?.description ?? '',
        logo: brand?.logo ?? '',
        website: brand?.website ?? '',
        is_active: brand?.is_active ?? true,
        is_featured: brand?.is_featured ?? false,
        sort_order: brand?.sort_order ?? 0,
    });

    const isEditing = Boolean(brand?.id);

    const submit = () => {
        if (isEditing) {
            form.put(`/admin/brands/${brand?.id}`);
        } else {
            form.post('/admin/brands');
        }
    };

    return (
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); submit(); }}>
            <div className="card-surface p-6">
                <h2 className="text-base font-semibold text-ink-950">Brand details</h2>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
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

                    <div>
                        <label className="mb-1 block text-sm font-medium text-ink-700">Slug <span className="text-ink-400">(optional)</span></label>
                        <input
                            value={form.data.slug}
                            onChange={(e) => form.setData('slug', e.target.value)}
                            type="text"
                            className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                        />
                        {form.errors.slug ? (
                            <p className="mt-1 text-xs text-ink-700">{form.errors.slug}</p>
                        ) : null}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-ink-700">Website</label>
                        <input
                            value={form.data.website}
                            onChange={(e) => form.setData('website', e.target.value)}
                            type="text"
                            placeholder="https://example.com"
                            className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                        />
                        {form.errors.website ? (
                            <p className="mt-1 text-xs text-ink-700">{form.errors.website}</p>
                        ) : null}
                    </div>

                    <div className="sm:col-span-2">
                        <label className="mb-1 block text-sm font-medium text-ink-700">Logo URL</label>
                        <input
                            value={form.data.logo}
                            onChange={(e) => form.setData('logo', e.target.value)}
                            type="text"
                            className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                        />
                        {form.errors.logo ? (
                            <p className="mt-1 text-xs text-ink-700">{form.errors.logo}</p>
                        ) : null}
                    </div>

                    <div className="sm:col-span-2">
                        <label className="mb-1 block text-sm font-medium text-ink-700">Description</label>
                        <textarea
                            value={form.data.description}
                            onChange={(e) => form.setData('description', e.target.value)}
                            rows={4}
                            className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                        ></textarea>
                        {form.errors.description ? (
                            <p className="mt-1 text-xs text-ink-700">{form.errors.description}</p>
                        ) : null}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-ink-700">Sort order</label>
                        <input
                            value={form.data.sort_order}
                            onChange={(e) => form.setData('sort_order', Number(e.target.value))}
                            type="number"
                            min="0"
                            className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                        />
                        {form.errors.sort_order ? (
                            <p className="mt-1 text-xs text-ink-700">{form.errors.sort_order}</p>
                        ) : null}
                    </div>

                    <div className="flex items-end gap-6">
                        <label className="flex items-center gap-2 text-sm text-ink-700">
                            <input
                                checked={form.data.is_active}
                                onChange={(e) => form.setData('is_active', e.target.checked)}
                                type="checkbox"
                                className="rounded border-bone-400 text-umber-700 focus:ring-umber-600"
                            />
                            Active
                        </label>
                        <label className="flex items-center gap-2 text-sm text-ink-700">
                            <input
                                checked={form.data.is_featured}
                                onChange={(e) => form.setData('is_featured', e.target.checked)}
                                type="checkbox"
                                className="rounded border-bone-400 text-umber-700 focus:ring-umber-600"
                            />
                            Featured
                        </label>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button type="submit" disabled={form.processing} className="btn btn-primary">
                    {isEditing ? 'Update brand' : 'Create brand'}
                </button>
                <Link href="/admin/brands" className="text-sm font-medium text-ink-600 hover:text-ink-950">Cancel</Link>
            </div>
        </form>
    );
}
