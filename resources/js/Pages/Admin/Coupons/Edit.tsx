import { Head } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import CouponForm from '../../../Components/Admin/CouponForm';

interface CouponTypeOption {
    value: string | number;
    label: string;
    [key: string]: unknown;
}

interface CouponModel {
    id: number;
    code: string;
    [key: string]: unknown;
}

interface Props {
    coupon: CouponModel;
    types?: CouponTypeOption[];
}

export default function CouponsEdit({ coupon, types = [] }: Props) {
    return (
        <AdminLayout>
            <Head title={`Edit ${coupon.code}`} />

            <div className="mb-6">
                <h1 className="title text-2xl">Edit coupon</h1>
                <p className="mt-1 text-sm text-ink-500">{coupon.code}</p>
            </div>

            <CouponForm coupon={coupon} types={types} />
        </AdminLayout>
    );
}
