import { Head } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import PageForm from '../../../Components/Admin/PageForm';
import type { PageProps } from '../../../types';

interface Page {
    id: number;
    title: string;
}

interface Props extends PageProps {
    page: Page;
}

export default function PagesEdit({ page }: Props) {
    return (
        <AdminLayout>
            <Head title={`Edit ${page.title}`} />

            <div className="mb-6">
                <h1 className="title text-2xl">Edit page</h1>
                <p className="mt-1 text-sm text-ink-500">{page.title}</p>
            </div>

            <PageForm page={page} />
        </AdminLayout>
    );
}
