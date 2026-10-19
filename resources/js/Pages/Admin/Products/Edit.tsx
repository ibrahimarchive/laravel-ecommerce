import { Head } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import ProductForm from '../../../Components/Admin/ProductForm';
import type { AttributeValue, BrandRef, CategoryOption, PageProps, Product } from '../../../types';

interface ProductAttribute {
    id: number;
    name: string;
    slug?: string;
    values?: AttributeValue[];
    [key: string]: unknown;
}

interface Props extends PageProps {
    product: Product;
    categories: CategoryOption[];
    brands: BrandRef[];
    attributes: ProductAttribute[];
}

export default function ProductsEdit({ product, categories = [], brands = [], attributes = [] }: Props) {
    return (
        <AdminLayout>
            <Head title={`Edit ${product.name}`} />
            <ProductForm product={product} categories={categories} brands={brands} attributes={attributes} />
        </AdminLayout>
    );
}
