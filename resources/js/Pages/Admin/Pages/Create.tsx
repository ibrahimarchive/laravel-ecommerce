import { Head } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import PageForm from '../../../Components/Admin/PageForm';

export default function PagesCreate() {
    return (
        <AdminLayout>
            <Head title="New page" />

            <div className="mb-6">
                <h1 className="title text-2xl">New page</h1>
                <p className="mt-1 text-sm text-ink-500">Create a new static content page.</p>
            </div>

            <PageForm />
        </AdminLayout>
    );
}
