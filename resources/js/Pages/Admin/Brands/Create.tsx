import { Head } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import BrandForm from '../../../Components/Admin/BrandForm';

export default function BrandsCreate() {
    return (
        <AdminLayout>
            <Head title="New brand" />

            <div className="mb-6">
                <h1 className="title text-2xl">New brand</h1>
                <p className="mt-1 text-sm text-ink-500">Add a new brand to your catalog.</p>
            </div>

            <BrandForm />
        </AdminLayout>
    );
}
