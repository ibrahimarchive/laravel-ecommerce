import { Head } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import CouponForm from '../../../Components/Admin/CouponForm';

interface CouponTypeOption {
    value: string | number;
    label: string;
    [key: string]: unknown;
}

interface Props {
    types?: CouponTypeOption[];
}

export default function CouponsCreate({ types = [] }: Props) {
    return (
        <AdminLayout>
            <Head title="New coupon" />

            <div className="mb-6">
                <h1 className="title text-2xl">New coupon</h1>
                <p className="mt-1 text-sm text-ink-500">Create a discount code for your customers.</p>
            </div>

            <CouponForm types={types} />
        </AdminLayout>
    );
}
