import { Link, useForm } from '@inertiajs/react';

interface ParentOption {
    id: number | string;
    name: string;
}

interface CategoryRecord {
    id?: number;
    name?: string | null;
    slug?: string | null;
    parent_id?: number | string | null;
    description?: string | null;
    image?: string | null;
    meta_title?: string | null;
    meta_description?: string | null;
    is_active?: boolean;
    is_featured?: boolean;
    sort_order?: number | null;
}

interface Props {
    parents?: ParentOption[];
    category?: CategoryRecord | null;
}

export default function CategoryForm({ parents = [], category }: Props) {
    const editing = !!category;

    const form = useForm({
        name: category?.name ?? '',
        slug: category?.slug ?? '',
        parent_id: category?.parent_id ?? '',
        description: category?.description ?? '',
        image: category?.image ?? '',
        meta_title: category?.meta_title ?? '',
        meta_description: category?.meta_description ?? '',
        is_active: category?.is_active ?? true,
        is_featured: category?.is_featured ?? false,
        sort_order: category?.sort_order ?? 0,
    });

    const submit = () => {
        if (editing) {
            form.put(`/admin/categories/${category?.id}`);
        } else {
            form.post('/admin/categories');
        }
    };

    return (
        <form onSubmit={(e) => { e.preventDefault(); submit(); }}>
            <div className="flex items-center justify-between">
                <h1 className="title text-2xl">{editing ? 'Edit category' : 'New category'}</h1>
                <div className="flex gap-3">
                    <Link href="/admin/categories" className="rounded-lg border border-bone-400 px-4 py-2 text-sm font-semibold text-ink-700 hover:bg-bone-50">Cancel</Link>
                    <button type="submit" disabled={form.processing} className="btn btn-primary btn-sm">
                        {editing ? 'Save changes' : 'Create category'}
                    </button>
                </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <div className="space-y-4 card-surface p-6 lg:col-span-2">
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
                    <div>
                        <label className="mb-1 block text-sm font-medium text-ink-700">Slug <span className="text-ink-400">(auto if empty)</span></label>
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
                        <label className="mb-1 block text-sm font-medium text-ink-700">Description</label>
                        <textarea
                            value={form.data.description}
                            onChange={(e) => form.setData('description', e.target.value)}
                            rows={4}
                            className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                        ></textarea>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-ink-700">Image URL</label>
                        <input
                            value={form.data.image}
                            onChange={(e) => form.setData('image', e.target.value)}
                            type="text"
                            placeholder="https://..."
                            className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                        />
                    </div>
                </div>

                <div className="space-y-4 card-surface p-6">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-ink-700">Parent category</label>
                        <select
                            value={form.data.parent_id}
                            onChange={(e) => form.setData('parent_id', e.target.value)}
                            className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                        >
                            <option value="">— None (top level) —</option>
                            {parents.map((option) => (
                                <option key={option.id} value={option.id}>{option.name}</option>
                            ))}
                        </select>
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
                    </div>
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
                    <div className="border-t border-bone-300 pt-4">
                        <label className="mb-1 block text-sm font-medium text-ink-700">Meta title</label>
                        <input
                            value={form.data.meta_title}
                            onChange={(e) => form.setData('meta_title', e.target.value)}
                            type="text"
                            className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-ink-700">Meta description</label>
                        <textarea
                            value={form.data.meta_description}
                            onChange={(e) => form.setData('meta_description', e.target.value)}
                            rows={2}
                            maxLength={500}
                            className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                        ></textarea>
                    </div>
                </div>
            </div>
        </form>
    );
}
