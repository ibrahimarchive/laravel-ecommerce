import { Link, useForm } from '@inertiajs/react';

interface AttributeValueRecord {
    id?: number | null;
    value?: string | null;
    color_hex?: string | null;
}

interface AttributeRecord {
    id?: number;
    name?: string | null;
    slug?: string | null;
    type?: string | null;
    is_filterable?: boolean;
    is_variation?: boolean;
    sort_order?: number | null;
    values?: AttributeValueRecord[];
}

interface AttributeValueRow {
    id: number | null;
    value: string;
    color_hex: string;
}

interface Props {
    attribute?: AttributeRecord | null;
}

export default function AttributeForm({ attribute }: Props) {
    const attributeValues: AttributeValueRow[] = (attribute?.values ?? []).map((value) => ({
        id: value.id ?? null,
        value: value.value ?? '',
        color_hex: value.color_hex ?? '',
    }));

    const form = useForm({
        name: attribute?.name ?? '',
        slug: attribute?.slug ?? '',
        type: attribute?.type ?? 'select',
        is_filterable: attribute?.is_filterable ?? true,
        is_variation: attribute?.is_variation ?? true,
        sort_order: attribute?.sort_order ?? 0,
        values: attributeValues.length ? attributeValues : [{ id: null, value: '', color_hex: '' }],
    });

    const isEditing = Boolean(attribute?.id);

    const addValue = () => {
        form.setData('values', [...form.data.values, { id: null, value: '', color_hex: '' }]);
    };

    const removeValue = (index: number) => {
        const remaining = form.data.values.filter((_, i) => i !== index);

        form.setData('values', remaining.length ? remaining : [{ id: null, value: '', color_hex: '' }]);
    };

    const updateValue = (index: number, patch: Partial<AttributeValueRow>) => {
        form.setData(
            'values',
            form.data.values.map((row, i) => (i === index ? { ...row, ...patch } : row)),
        );
    };

    const submit = () => {
        if (isEditing) {
            form.put(`/admin/attributes/${attribute?.id}`);
        } else {
            form.post('/admin/attributes');
        }
    };

    return (
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); submit(); }}>
            <div className="card-surface p-6">
                <h2 className="text-base font-semibold text-ink-950">Attribute details</h2>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
                        <label className="mb-1 block text-sm font-medium text-ink-700">Type</label>
                        <select
                            value={form.data.type}
                            onChange={(e) => form.setData('type', e.target.value)}
                            className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                        >
                            <option value="select">Select</option>
                            <option value="color">Color</option>
                            <option value="text">Text</option>
                        </select>
                        {form.errors.type ? (
                            <p className="mt-1 text-xs text-ink-700">{form.errors.type}</p>
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

                    <div className="flex items-end gap-6 sm:col-span-2">
                        <label className="flex items-center gap-2 text-sm text-ink-700">
                            <input
                                checked={form.data.is_filterable}
                                onChange={(e) => form.setData('is_filterable', e.target.checked)}
                                type="checkbox"
                                className="rounded border-bone-400 text-umber-700 focus:ring-umber-600"
                            />
                            Filterable
                        </label>
                        <label className="flex items-center gap-2 text-sm text-ink-700">
                            <input
                                checked={form.data.is_variation}
                                onChange={(e) => form.setData('is_variation', e.target.checked)}
                                type="checkbox"
                                className="rounded border-bone-400 text-umber-700 focus:ring-umber-600"
                            />
                            Used for variations
                        </label>
                    </div>
                </div>
            </div>

            <div className="card-surface p-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-ink-950">Values</h2>
                    <button type="button" className="rounded-lg border border-bone-400 px-3 py-1.5 text-sm font-medium text-ink-700 hover:bg-bone-50" onClick={addValue}>
                        Add value
                    </button>
                </div>

                <div className="mt-4 space-y-3">
                    {form.data.values.map((value, index) => (
                        <div key={index} className="flex items-center gap-3">
                            <input
                                value={value.value}
                                onChange={(e) => updateValue(index, { value: e.target.value })}
                                type="text"
                                placeholder="Value"
                                className="flex-1 rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                            />
                            {form.data.type === 'color' ? (
                                <input
                                    value={value.color_hex}
                                    onChange={(e) => updateValue(index, { color_hex: e.target.value })}
                                    type="text"
                                    placeholder="#000000"
                                    className="w-28 rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                                />
                            ) : null}
                            <button type="button" className="text-sm font-semibold text-ink-700 hover:text-ink-600" onClick={() => removeValue(index)}>Remove</button>
                        </div>
                    ))}
                </div>
                {form.errors.values ? (
                    <p className="mt-2 text-xs text-ink-700">{form.errors.values}</p>
                ) : null}
            </div>

            <div className="flex items-center gap-3">
                <button type="submit" disabled={form.processing} className="btn btn-primary">
                    {isEditing ? 'Update attribute' : 'Create attribute'}
                </button>
                <Link href="/admin/attributes" className="text-sm font-medium text-ink-600 hover:text-ink-950">Cancel</Link>
            </div>
        </form>
    );
}
