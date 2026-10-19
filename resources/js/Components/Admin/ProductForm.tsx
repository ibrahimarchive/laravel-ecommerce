import { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';

interface Option {
    id: number | string;
    name: string;
}

interface AttributeValueOption {
    id: number;
    value: string;
}

interface AttributeGroup {
    id: number;
    name: string;
    values?: AttributeValueOption[];
}

interface ImageRow {
    path: string;
    alt: string;
    is_primary: boolean;
}

interface VariantRow {
    name: string;
    sku: string;
    price: string | number;
    compare_price: string | number;
    stock_quantity: number | string;
    is_active: boolean;
    attribute_value_ids: number[];
}

interface ProductRecord {
    [key: string]: any;
}

interface Props {
    categories?: Option[];
    brands?: Option[];
    attributes?: AttributeGroup[];
    product?: ProductRecord | null;
}

const blankVariant = (): VariantRow => ({
    name: '',
    sku: '',
    price: '',
    compare_price: '',
    stock_quantity: 0,
    is_active: true,
    attribute_value_ids: [],
});

const tabs = [
    { key: 'general', label: 'General' },
    { key: 'pricing', label: 'Pricing & stock' },
    { key: 'images', label: 'Images' },
    { key: 'variants', label: 'Variants' },
    { key: 'seo', label: 'SEO' },
];

export default function ProductForm({ categories = [], brands = [], attributes = [], product }: Props) {
    const editing = !!product;

    const sourceImages: any[] = product?.images ?? [];
    const images: ImageRow[] = sourceImages.map((image) => ({
        path: image.path,
        alt: image.alt ?? '',
        is_primary: !!image.is_primary,
    }));

    const sourceVariants: any[] = product?.variants ?? [];
    const variants: VariantRow[] = sourceVariants.map((variant) => ({
        name: variant.name ?? '',
        sku: variant.sku ?? '',
        price: variant.price ?? '',
        compare_price: variant.compare_price ?? '',
        stock_quantity: variant.stock_quantity ?? 0,
        is_active: variant.is_active ?? true,
        attribute_value_ids: variant.attribute_value_ids ?? [],
    }));

    const attributeValueIds: number[] = product?.attribute_value_ids ?? [];

    const form = useForm({
        name: product?.name ?? '',
        slug: product?.slug ?? '',
        sku: product?.sku ?? '',
        category_id: product?.category_id ?? '',
        brand_id: product?.brand_id ?? '',
        short_description: product?.short_description ?? '',
        description: product?.description ?? '',
        price: product?.price ?? '',
        compare_price: product?.compare_price ?? '',
        cost_price: product?.cost_price ?? '',
        stock_quantity: product?.stock_quantity ?? 0,
        low_stock_threshold: product?.low_stock_threshold ?? 5,
        manage_stock: product?.manage_stock ?? true,
        is_active: product?.is_active ?? true,
        is_featured: product?.is_featured ?? false,
        weight: product?.weight ?? '',
        meta_title: product?.meta_title ?? '',
        meta_description: product?.meta_description ?? '',
        published_at: product?.published_at ? String(product.published_at).slice(0, 10) : '',
        attribute_value_ids: attributeValueIds,
        images: images.length ? images : [{ path: '', alt: '', is_primary: true }],
        variants,
    });

    const [tab, setTab] = useState('general');

    const tabClass = (key: string, base: string) => (tab === key ? base : `${base} hidden`);

    const hasAttribute = (valueId: number) => (form.data.attribute_value_ids as number[]).includes(valueId);

    const toggleAttribute = (valueId: number) => {
        if (hasAttribute(valueId)) {
            form.setData('attribute_value_ids', form.data.attribute_value_ids.filter((id) => id !== valueId));
        } else {
            form.setData('attribute_value_ids', [...form.data.attribute_value_ids, valueId]);
        }
    };

    const variantHasValue = (variant: VariantRow, valueId: number) => variant.attribute_value_ids.includes(valueId);

    const toggleVariantValue = (index: number, valueId: number) => {
        form.setData(
            'variants',
            form.data.variants.map((variant, i) => {
                if (i !== index) {
                    return variant;
                }

                const ids = variant.attribute_value_ids.includes(valueId)
                    ? variant.attribute_value_ids.filter((id) => id !== valueId)
                    : [...variant.attribute_value_ids, valueId];

                return { ...variant, attribute_value_ids: ids };
            }),
        );
    };

    const updateVariant = (index: number, patch: Partial<VariantRow>) => {
        form.setData(
            'variants',
            form.data.variants.map((variant, i) => (i === index ? { ...variant, ...patch } : variant)),
        );
    };

    const addImage = () => form.setData('images', [...form.data.images, { path: '', alt: '', is_primary: false }]);
    const updateImage = (index: number, patch: Partial<ImageRow>) => {
        form.setData(
            'images',
            form.data.images.map((image, i) => (i === index ? { ...image, ...patch } : image)),
        );
    };
    const removeImage = (index: number) => form.setData('images', form.data.images.filter((_, i) => i !== index));
    const setPrimaryImage = (index: number) => {
        form.setData('images', form.data.images.map((image, i) => ({ ...image, is_primary: i === index })));
    };

    const addVariant = () => form.setData('variants', [...form.data.variants, blankVariant()]);
    const removeVariant = (index: number) => form.setData('variants', form.data.variants.filter((_, i) => i !== index));

    const submit = () => {
        if (editing) {
            form.put(`/admin/products/${product?.id}`);
        } else {
            form.post('/admin/products');
        }
    };

    return (
        <form onSubmit={(e) => { e.preventDefault(); submit(); }}>
            <div className="flex items-center justify-between">
                <h1 className="title text-2xl">{editing ? 'Edit product' : 'New product'}</h1>
                <div className="flex gap-3">
                    <Link href="/admin/products" className="rounded-lg border border-bone-400 px-4 py-2 text-sm font-semibold text-ink-700 hover:bg-bone-50">Cancel</Link>
                    <button type="submit" disabled={form.processing} className="btn btn-primary btn-sm">
                        {editing ? 'Save changes' : 'Create product'}
                    </button>
                </div>
            </div>

            <div className="mt-6 flex gap-1 border-b border-bone-300">
                {tabs.map((item) => (
                    <button
                        key={item.key}
                        type="button"
                        className={
                            'border-b-2 px-4 py-2 text-sm font-semibold transition ' +
                            (tab === item.key ? 'border-umber-700 text-umber-700' : 'border-transparent text-ink-500 hover:text-ink-800')
                        }
                        onClick={() => setTab(item.key)}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            <div className={tabClass('general', 'mt-6 grid gap-6 lg:grid-cols-3')}>
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
                    <div className="grid grid-cols-2 gap-4">
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
                            <label className="mb-1 block text-sm font-medium text-ink-700">SKU</label>
                            <input
                                value={form.data.sku}
                                onChange={(e) => form.setData('sku', e.target.value)}
                                type="text"
                                className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                            />
                            {form.errors.sku ? (
                                <p className="mt-1 text-xs text-ink-700">{form.errors.sku}</p>
                            ) : null}
                        </div>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-ink-700">Short description</label>
                        <input
                            value={form.data.short_description}
                            onChange={(e) => form.setData('short_description', e.target.value)}
                            type="text"
                            maxLength={500}
                            className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-ink-700">Full description</label>
                        <textarea
                            value={form.data.description}
                            onChange={(e) => form.setData('description', e.target.value)}
                            rows={6}
                            className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                        ></textarea>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-4 card-surface p-6">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-ink-700">Category</label>
                            <select
                                value={form.data.category_id}
                                onChange={(e) => form.setData('category_id', e.target.value)}
                                className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                            >
                                <option value="">— None —</option>
                                {categories.map((option) => (
                                    <option key={option.id} value={option.id}>{option.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-ink-700">Brand</label>
                            <select
                                value={form.data.brand_id}
                                onChange={(e) => form.setData('brand_id', e.target.value)}
                                className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                            >
                                <option value="">— None —</option>
                                {brands.map((option) => (
                                    <option key={option.id} value={option.id}>{option.name}</option>
                                ))}
                            </select>
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
                        <div>
                            <label className="mb-1 block text-sm font-medium text-ink-700">Publish date</label>
                            <input
                                value={form.data.published_at}
                                onChange={(e) => form.setData('published_at', e.target.value)}
                                type="date"
                                className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                            />
                        </div>
                    </div>

                    {attributes.length ? (
                        <div className="card-surface p-6">
                            <h3 className="text-sm font-semibold text-ink-950">Attributes</h3>
                            {attributes.map((attribute) => (
                                <div key={attribute.id} className="mt-4">
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">{attribute.name}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {(attribute.values ?? []).map((value) => (
                                            <button
                                                key={value.id}
                                                type="button"
                                                className={
                                                    'rounded-full border px-3 py-1 text-xs font-medium ' +
                                                    (hasAttribute(value.id) ? 'border-umber-700 bg-umber-700 text-white' : 'border-bone-400 text-ink-600 hover:bg-bone-50')
                                                }
                                                onClick={() => toggleAttribute(value.id)}
                                            >
                                                {value.value}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : null}
                </div>
            </div>

            <div className={tabClass('pricing', 'mt-6 grid gap-6 lg:grid-cols-2')}>
                <div className="space-y-4 card-surface p-6">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-500">Pricing</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-ink-700">Price</label>
                            <input
                                value={form.data.price}
                                onChange={(e) => form.setData('price', e.target.value)}
                                type="number"
                                step="0.01"
                                min="0"
                                className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                            />
                            {form.errors.price ? (
                                <p className="mt-1 text-xs text-ink-700">{form.errors.price}</p>
                            ) : null}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-ink-700">Compare at</label>
                            <input
                                value={form.data.compare_price}
                                onChange={(e) => form.setData('compare_price', e.target.value)}
                                type="number"
                                step="0.01"
                                min="0"
                                className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-ink-700">Cost</label>
                            <input
                                value={form.data.cost_price}
                                onChange={(e) => form.setData('cost_price', e.target.value)}
                                type="number"
                                step="0.01"
                                min="0"
                                className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-ink-700">Weight (kg)</label>
                        <input
                            value={form.data.weight}
                            onChange={(e) => form.setData('weight', e.target.value)}
                            type="number"
                            step="0.001"
                            min="0"
                            className="w-full max-w-xs rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                        />
                    </div>
                </div>

                <div className="space-y-4 card-surface p-6">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-500">Inventory</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-ink-700">Stock quantity</label>
                            <input
                                value={form.data.stock_quantity}
                                onChange={(e) => form.setData('stock_quantity', e.target.value)}
                                type="number"
                                min="0"
                                className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                            />
                            {form.errors.stock_quantity ? (
                                <p className="mt-1 text-xs text-ink-700">{form.errors.stock_quantity}</p>
                            ) : null}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-ink-700">Low stock threshold</label>
                            <input
                                value={form.data.low_stock_threshold}
                                onChange={(e) => form.setData('low_stock_threshold', e.target.value)}
                                type="number"
                                min="0"
                                className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                            />
                        </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-ink-700">
                        <input
                            checked={form.data.manage_stock}
                            onChange={(e) => form.setData('manage_stock', e.target.checked)}
                            type="checkbox"
                            className="rounded border-bone-400 text-umber-700 focus:ring-umber-600"
                        />
                        Track inventory for this product
                    </label>
                </div>
            </div>

            <div className={tabClass('images', 'mt-6 card-surface p-6')}>
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-500">Images</h3>
                    <button type="button" onClick={addImage} className="rounded-lg border border-bone-400 px-3 py-1.5 text-sm font-semibold text-ink-700 hover:bg-bone-50">Add image</button>
                </div>
                <p className="mt-2 text-xs text-ink-400">Provide an image URL. The primary image is used in listings.</p>
                <div className="mt-4 space-y-3">
                    {form.data.images.map((image, index) => (
                        <div key={index} className="flex items-center gap-3 rounded-lg border border-bone-300 p-3">
                            {image.path ? (
                                <img src={image.path} alt={image.alt} className="h-12 w-12 rounded object-cover" />
                            ) : (
                                <div className="h-12 w-12 rounded bg-bone-100"></div>
                            )}
                            <input
                                value={image.path}
                                onChange={(e) => updateImage(index, { path: e.target.value })}
                                type="text"
                                placeholder="https://..."
                                className="flex-1 rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                            />
                            <input
                                value={image.alt}
                                onChange={(e) => updateImage(index, { alt: e.target.value })}
                                type="text"
                                placeholder="Alt text"
                                className="w-40 rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                            />
                            <label className="flex shrink-0 items-center gap-1 text-xs text-ink-600">
                                <input type="radio" name="primary_image" checked={image.is_primary} className="text-umber-700 focus:ring-umber-600" onChange={() => setPrimaryImage(index)} />
                                Primary
                            </label>
                            <button type="button" onClick={() => removeImage(index)} className="text-sm font-semibold text-ink-700 hover:text-ink-600">Remove</button>
                        </div>
                    ))}
                </div>
            </div>

            <div className={tabClass('variants', 'mt-6 card-surface p-6')}>
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-500">Variants</h3>
                    <button type="button" onClick={addVariant} className="rounded-lg border border-bone-400 px-3 py-1.5 text-sm font-semibold text-ink-700 hover:bg-bone-50">Add variant</button>
                </div>
                <p className="mt-2 text-xs text-ink-400">Leave SKU blank to auto-generate. Variant price falls back to the product price when empty.</p>

                <div className="mt-4 space-y-4">
                    {form.data.variants.map((variant, index) => (
                        <div key={index} className="rounded-lg border border-bone-300 p-4">
                            <div className="grid gap-3 sm:grid-cols-5">
                                <div className="sm:col-span-2">
                                    <label className="mb-1 block text-xs font-medium text-ink-600">Name</label>
                                    <input
                                        value={variant.name}
                                        onChange={(e) => updateVariant(index, { name: e.target.value })}
                                        type="text"
                                        className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-ink-600">SKU</label>
                                    <input
                                        value={variant.sku}
                                        onChange={(e) => updateVariant(index, { sku: e.target.value })}
                                        type="text"
                                        className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-ink-600">Price</label>
                                    <input
                                        value={variant.price}
                                        onChange={(e) => updateVariant(index, { price: e.target.value })}
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-ink-600">Stock</label>
                                    <input
                                        value={variant.stock_quantity}
                                        onChange={(e) => updateVariant(index, { stock_quantity: e.target.value })}
                                        type="number"
                                        min="0"
                                        className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                                    />
                                </div>
                            </div>

                            {attributes.length ? (
                                <div className="mt-3 flex flex-wrap gap-4">
                                    {attributes.map((attribute) => (
                                        <div key={attribute.id}>
                                            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-400">{attribute.name}</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {(attribute.values ?? []).map((value) => (
                                                    <button
                                                        key={value.id}
                                                        type="button"
                                                        className={
                                                            'rounded-full border px-2.5 py-0.5 text-xs font-medium ' +
                                                            (variantHasValue(variant, value.id) ? 'border-umber-700 bg-umber-700 text-white' : 'border-bone-400 text-ink-600 hover:bg-bone-50')
                                                        }
                                                        onClick={() => toggleVariantValue(index, value.id)}
                                                    >
                                                        {value.value}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : null}

                            <div className="mt-3 flex items-center justify-between">
                                <label className="flex items-center gap-2 text-sm text-ink-700">
                                    <input
                                        checked={variant.is_active}
                                        onChange={(e) => updateVariant(index, { is_active: e.target.checked })}
                                        type="checkbox"
                                        className="rounded border-bone-400 text-umber-700 focus:ring-umber-600"
                                    />
                                    Active
                                </label>
                                <button type="button" onClick={() => removeVariant(index)} className="text-sm font-semibold text-ink-700 hover:text-ink-600">Remove variant</button>
                            </div>
                        </div>
                    ))}
                </div>
                {!form.data.variants.length ? (
                    <p className="mt-4 rounded-lg border border-dashed border-bone-400 px-4 py-8 text-center text-sm text-ink-500">No variants yet.</p>
                ) : null}
            </div>

            <div className={tabClass('seo', 'mt-6 max-w-2xl space-y-4 card-surface p-6')}>
                <div>
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
                        rows={3}
                        maxLength={500}
                        className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                    ></textarea>
                </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
                <Link href="/admin/products" className="rounded-lg border border-bone-400 px-4 py-2 text-sm font-semibold text-ink-700 hover:bg-bone-50">Cancel</Link>
                <button type="submit" disabled={form.processing} className="btn btn-primary">
                    {editing ? 'Save changes' : 'Create product'}
                </button>
            </div>
        </form>
    );
}
