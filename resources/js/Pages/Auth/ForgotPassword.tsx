import { Link, useForm } from '@inertiajs/react';
import AuthLayout from '../../Layouts/AuthLayout';

interface Props {
    status?: string | null;
}

export default function ForgotPassword({ status = null }: Props) {
    const form = useForm({
        email: '',
    });

    const submit = () => {
        form.post('/forgot-password');
    };

    return (
        <AuthLayout title="Forgot your password?">
            <p className="text-sm text-ink-500">
                Enter your email and we'll send you a reset link.
            </p>

            {status && (
                <div className="mt-4 rounded-lg bg-bone-100 px-4 py-3 text-sm font-medium text-umber-800">
                    {status}
                </div>
            )}

            <form className="mt-5 space-y-5" onSubmit={(e) => { e.preventDefault(); submit(); }}>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-ink-700">Email</label>
                    <input
                        id="email"
                        value={form.data.email}
                        onChange={(e) => form.setData('email', e.target.value)}
                        type="email"
                        autoFocus
                        className="mt-1 w-full rounded-lg border border-bone-400 px-3 py-2.5 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                    />
                    {form.errors.email && <p className="mt-1 text-xs text-ink-700">{form.errors.email}</p>}
                </div>

                <button
                    type="submit"
                    disabled={form.processing}
                    className="btn btn-primary w-full"
                >
                    {form.processing ? 'Sending...' : 'Email reset link'}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-ink-500">
                <Link href="/login" className="font-semibold text-umber-700 hover:text-umber-600">Back to sign in</Link>
            </p>
        </AuthLayout>
    );
}
