import { Head } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import BrandForm from '../../../Components/Admin/BrandForm';

interface BrandModel {
    id: number;
    name: string;
    [key: string]: unknown;
}

interface Props {
    brand: BrandModel;
}

export default function BrandsEdit({ brand }: Props) {
    return (
        <AdminLayout>
            <Head title={`Edit ${brand.name}`} />

            <div className="mb-6">
                <h1 className="title text-2xl">Edit brand</h1>
                <p className="mt-1 text-sm text-ink-500">{brand.name}</p>
            </div>

            <BrandForm brand={brand} />
        </AdminLayout>
    );
}
