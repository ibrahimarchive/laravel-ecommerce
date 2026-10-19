import { useForm } from '@inertiajs/react';
import AuthLayout from '../../Layouts/AuthLayout';

interface Props {
    email?: string;
    token: string;
}

export default function ResetPassword({ email = '', token }: Props) {
    const form = useForm({
        token,
        email,
        password: '',
        password_confirmation: '',
    });

    const submit = () => {
        form.post('/reset-password', {
            onFinish: () => form.reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title="Reset your password">
            <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); submit(); }}>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-ink-700">Email</label>
                    <input
                        id="email"
                        value={form.data.email}
                        onChange={(e) => form.setData('email', e.target.value)}
                        type="email"
                        className="mt-1 w-full rounded-lg border border-bone-400 px-3 py-2.5 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                    />
                    {form.errors.email && <p className="mt-1 text-xs text-ink-700">{form.errors.email}</p>}
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-ink-700">New password</label>
                    <input
                        id="password"
                        value={form.data.password}
                        onChange={(e) => form.setData('password', e.target.value)}
                        type="password"
                        autoComplete="new-password"
                        autoFocus
                        className="mt-1 w-full rounded-lg border border-bone-400 px-3 py-2.5 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                    />
                    {form.errors.password && <p className="mt-1 text-xs text-ink-700">{form.errors.password}</p>}
                </div>

                <div>
                    <label htmlFor="password_confirmation" className="block text-sm font-medium text-ink-700">Confirm password</label>
                    <input
                        id="password_confirmation"
                        value={form.data.password_confirmation}
                        onChange={(e) => form.setData('password_confirmation', e.target.value)}
                        type="password"
                        autoComplete="new-password"
                        className="mt-1 w-full rounded-lg border border-bone-400 px-3 py-2.5 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                    />
                </div>

                <button
                    type="submit"
                    disabled={form.processing}
                    className="btn btn-primary w-full"
                >
                    {form.processing ? 'Resetting...' : 'Reset password'}
                </button>
            </form>
        </AuthLayout>
    );
}
