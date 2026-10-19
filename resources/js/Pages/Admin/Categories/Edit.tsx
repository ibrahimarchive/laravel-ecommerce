import { Head } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import CategoryForm from '../../../Components/Admin/CategoryForm';

interface ParentOption {
    id: number;
    name: string;
    [key: string]: unknown;
}

interface CategoryModel {
    id: number;
    name: string;
    [key: string]: unknown;
}

interface Props {
    parents?: ParentOption[];
    category: CategoryModel;
}

export default function CategoriesEdit({ parents = [], category }: Props) {
    return (
        <AdminLayout>
            <Head title={`Edit ${category.name}`} />
            <CategoryForm parents={parents} category={category} />
        </AdminLayout>
    );
}
