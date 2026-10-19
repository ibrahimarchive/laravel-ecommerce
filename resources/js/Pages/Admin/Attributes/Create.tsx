import { Head } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import AttributeForm from '../../../Components/Admin/AttributeForm';

export default function AttributesCreate() {
    return (
        <AdminLayout>
            <Head title="New attribute" />

            <div className="mb-6">
                <h1 className="title text-2xl">New attribute</h1>
                <p className="mt-1 text-sm text-ink-500">Add a new product attribute and its values.</p>
            </div>

            <AttributeForm />
        </AdminLayout>
    );
}
