import { Head } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import CategoryForm from '../../../Components/Admin/CategoryForm';

interface ParentOption {
    id: number;
    name: string;
    [key: string]: unknown;
}

interface Props {
    parents?: ParentOption[];
}

export default function CategoriesCreate({ parents = [] }: Props) {
    return (
        <AdminLayout>
            <Head title="New category" />
            <CategoryForm parents={parents} />
        </AdminLayout>
    );
}
