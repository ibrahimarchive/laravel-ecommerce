import { Head } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import AttributeForm from '../../../Components/Admin/AttributeForm';

interface AttributeModel {
    id: number;
    name: string;
    [key: string]: unknown;
}

interface Props {
    attribute: AttributeModel;
}

export default function AttributesEdit({ attribute }: Props) {
    return (
        <AdminLayout>
            <Head title={`Edit ${attribute.name}`} />

            <div className="mb-6">
                <h1 className="title text-2xl">Edit attribute</h1>
                <p className="mt-1 text-sm text-ink-500">{attribute.name}</p>
            </div>

            <AttributeForm attribute={attribute} />
        </AdminLayout>
    );
}
