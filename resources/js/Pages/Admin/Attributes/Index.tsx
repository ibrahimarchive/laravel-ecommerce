import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

interface AttributeValueItem {
    id: number;
    value: string;
    color_hex?: string | null;
}

interface AttributeItem {
    id: number;
    name: string;
    slug: string;
    type: string;
    is_filterable?: boolean;
    is_variation?: boolean;
    values_count: number;
    sort_order: number;
    values: AttributeValueItem[];
}

interface Props {
    attributes?: AttributeItem[];
}

export default function AttributesIndex({ attributes = [] }: Props) {
    const [deleting, setDeleting] = useState<number | null>(null);

    function destroy(attribute: AttributeItem) {
        if (!confirm(`Delete attribute "${attribute.name}" and all its values?`)) {
            return;
        }

        setDeleting(attribute.id);
        router.delete(`/admin/attributes/${attribute.id}`, { onFinish: () => setDeleting(null) });
    }

    return (
        <AdminLayout>
            <Head title="Attributes" />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="title text-2xl">Attributes</h1>
                    <p className="mt-1 text-sm text-ink-500">Define product options like size, color, and material.</p>
                </div>
                <Link href="/admin/attributes/create" className="btn btn-primary btn-sm">
                    New attribute
                </Link>
            </div>

            <div className="mt-6 space-y-4">
                {attributes.map((attribute) => (
                    <div key={attribute.id} className="card-surface p-5">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-base font-semibold text-ink-950">{attribute.name}</h2>
                                    <span className="rounded-full bg-bone-100 px-2.5 py-1 text-xs font-semibold text-ink-600">{attribute.type}</span>
                                    {attribute.is_filterable && (
                                        <span className="rounded-full bg-bone-100 px-2.5 py-1 text-xs font-semibold text-ink-900">Filterable</span>
                                    )}
                                    {attribute.is_variation && (
                                        <span className="rounded-full bg-bone-100 px-2.5 py-1 text-xs font-semibold text-umber-800">Variation</span>
                                    )}
                                </div>
                                <p className="mt-1 text-xs text-ink-400">{attribute.slug} · {attribute.values_count} values · order {attribute.sort_order}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Link href={`/admin/attributes/${attribute.id}/edit`} className="text-sm font-semibold text-umber-700 hover:text-umber-600">Edit</Link>
                                <button type="button" disabled={deleting === attribute.id} className="text-sm font-semibold text-ink-700 hover:text-ink-600 disabled:text-bone-400" onClick={() => destroy(attribute)}>
                                    Delete
                                </button>
                            </div>
                        </div>

                        {attribute.values.length ? (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {attribute.values.map((value) => (
                                    <span key={value.id} className="inline-flex items-center gap-1.5 rounded-lg border border-bone-300 px-2.5 py-1 text-xs text-ink-700">
                                        {value.color_hex && (
                                            <span className="h-3 w-3 rounded-full border border-bone-400" style={{ backgroundColor: value.color_hex }}></span>
                                        )}
                                        {value.value}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-4 text-sm text-ink-400">No values yet.</p>
                        )}
                    </div>
                ))}

                {!attributes.length && (
                    <p className="rounded-xl border border-dashed border-bone-400 bg-canvas-deep px-5 py-10 text-center text-sm text-ink-500">
                        No attributes yet.
                    </p>
                )}
            </div>
        </AdminLayout>
    );
}
