import { Head } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import ProductForm from '../../../Components/Admin/ProductForm';
import type { AttributeValue, BrandRef, CategoryOption, PageProps } from '../../../types';

interface ProductAttribute {
    id: number;
    name: string;
    slug?: string;
    values?: AttributeValue[];
    [key: string]: unknown;
}

interface Props extends PageProps {
    categories: CategoryOption[];
    brands: BrandRef[];
    attributes: ProductAttribute[];
}

export default function ProductsCreate({ categories = [], brands = [], attributes = [] }: Props) {
    return (
        <AdminLayout>
            <Head title="New product" />
            <ProductForm categories={categories} brands={brands} attributes={attributes} />
        </AdminLayout>
    );
}
