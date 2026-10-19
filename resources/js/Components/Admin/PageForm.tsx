import { Link, useForm } from '@inertiajs/react';

interface PageRecord {
    id?: number;
    title?: string | null;
    slug?: string | null;
    excerpt?: string | null;
    content?: string | null;
    meta_title?: string | null;
    meta_description?: string | null;
    is_published?: boolean;
    show_in_footer?: boolean;
    published_at?: string | null;
    sort_order?: number | null;
}

interface Props {
    page?: PageRecord | null;
}

export default function PageForm({ page }: Props) {
    const form = useForm({
        title: page?.title ?? '',
        slug: page?.slug ?? '',
        excerpt: page?.excerpt ?? '',
        content: page?.content ?? '',
        meta_title: page?.meta_title ?? '',
        meta_description: page?.meta_description ?? '',
        is_published: page?.is_published ?? true,
        show_in_footer: page?.show_in_footer ?? true,
        published_at: page?.published_at ?? '',
        sort_order: page?.sort_order ?? 0,
    });

    const isEditing = Boolean(page?.id);

    const submit = () => {
        if (isEditing) {
            form.put(`/admin/pages/${page?.id}`);
        } else {
            form.post('/admin/pages');
        }
    };

    return (
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); submit(); }}>
            <div className="card-surface p-6">
                <h2 className="text-base font-semibold text-ink-950">Page content</h2>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-ink-700">Title</label>
                        <input
                            value={form.data.title}
                            onChange={(e) => form.setData('title', e.target.value)}
                            type="text"
                            className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                        />
                        {form.errors.title ? (
                            <p className="mt-1 text-xs text-ink-700">{form.errors.title}</p>
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

                    <div className="sm:col-span-2">
                        <label className="mb-1 block text-sm font-medium text-ink-700">Excerpt</label>
                        <textarea
                            value={form.data.excerpt}
                            onChange={(e) => form.setData('excerpt', e.target.value)}
                            rows={2}
                            className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                        ></textarea>
                        {form.errors.excerpt ? (
                            <p className="mt-1 text-xs text-ink-700">{form.errors.excerpt}</p>
                        ) : null}
                    </div>

                    <div className="sm:col-span-2">
                        <label className="mb-1 block text-sm font-medium text-ink-700">Content <span className="text-ink-400">(HTML allowed)</span></label>
                        <textarea
                            value={form.data.content}
                            onChange={(e) => form.setData('content', e.target.value)}
                            rows={14}
                            className="w-full rounded-lg border border-bone-400 px-3 py-2 font-mono text-xs focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                        ></textarea>
                        {form.errors.content ? (
                            <p className="mt-1 text-xs text-ink-700">{form.errors.content}</p>
                        ) : null}
                    </div>
                </div>
            </div>

            <div className="card-surface p-6">
                <h2 className="text-base font-semibold text-ink-950">Publishing</h2>

                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-ink-700">Publish date</label>
                        <input
                            value={form.data.published_at}
                            onChange={(e) => form.setData('published_at', e.target.value)}
                            type="date"
                            className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                        />
                        {form.errors.published_at ? (
                            <p className="mt-1 text-xs text-ink-700">{form.errors.published_at}</p>
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
                                checked={form.data.is_published}
                                onChange={(e) => form.setData('is_published', e.target.checked)}
                                type="checkbox"
                                className="rounded border-bone-400 text-umber-700 focus:ring-umber-600"
                            />
                            Published
                        </label>
                        <label className="flex items-center gap-2 text-sm text-ink-700">
                            <input
                                checked={form.data.show_in_footer}
                                onChange={(e) => form.setData('show_in_footer', e.target.checked)}
                                type="checkbox"
                                className="rounded border-bone-400 text-umber-700 focus:ring-umber-600"
                            />
                            Show in footer
                        </label>
                    </div>
                </div>
            </div>

            <div className="card-surface p-6">
                <h2 className="text-base font-semibold text-ink-950">SEO</h2>

                <div className="mt-4 grid gap-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-ink-700">Meta title</label>
                        <input
                            value={form.data.meta_title}
                            onChange={(e) => form.setData('meta_title', e.target.value)}
                            type="text"
                            className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                        />
                        {form.errors.meta_title ? (
                            <p className="mt-1 text-xs text-ink-700">{form.errors.meta_title}</p>
                        ) : null}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-ink-700">Meta description</label>
                        <textarea
                            value={form.data.meta_description}
                            onChange={(e) => form.setData('meta_description', e.target.value)}
                            rows={2}
                            className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                        ></textarea>
                        {form.errors.meta_description ? (
                            <p className="mt-1 text-xs text-ink-700">{form.errors.meta_description}</p>
                        ) : null}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button type="submit" disabled={form.processing} className="btn btn-primary">
                    {isEditing ? 'Update page' : 'Create page'}
                </button>
                <Link href="/admin/pages" className="text-sm font-medium text-ink-600 hover:text-ink-950">Cancel</Link>
            </div>
        </form>
    );
}
