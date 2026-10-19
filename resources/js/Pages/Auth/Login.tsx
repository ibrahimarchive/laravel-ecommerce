import { Link, useForm } from '@inertiajs/react';
import AuthLayout from '../../Layouts/AuthLayout';

interface Props {
    status?: string | null;
    canResetPassword?: boolean;
}

export default function Login({ status = null, canResetPassword = true }: Props) {
    const form = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = () => {
        form.post('/login', {
            onFinish: () => form.reset('password'),
        });
    };

    return (
        <AuthLayout title="Sign in">
            {status && (
                <div className="mb-4 rounded-lg bg-bone-100 px-4 py-3 text-sm font-medium text-umber-800">
                    {status}
                </div>
            )}

            <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); submit(); }}>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-ink-700">Email</label>
                    <input
                        id="email"
                        value={form.data.email}
                        onChange={(e) => form.setData('email', e.target.value)}
                        type="email"
                        autoComplete="username"
                        autoFocus
                        className="mt-1 w-full rounded-lg border border-bone-400 px-3 py-2.5 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                    />
                    {form.errors.email && <p className="mt-1 text-xs text-ink-700">{form.errors.email}</p>}
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-ink-700">Password</label>
                    <input
                        id="password"
                        value={form.data.password}
                        onChange={(e) => form.setData('password', e.target.value)}
                        type="password"
                        autoComplete="current-password"
                        className="mt-1 w-full rounded-lg border border-bone-400 px-3 py-2.5 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                    />
                    {form.errors.password && <p className="mt-1 text-xs text-ink-700">{form.errors.password}</p>}
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-ink-600">
                        <input
                            checked={form.data.remember}
                            onChange={(e) => form.setData('remember', e.target.checked)}
                            type="checkbox"
                            className="rounded border-bone-400"
                        />
                        Remember me
                    </label>
                    {canResetPassword && (
                        <Link href="/forgot-password" className="text-sm font-medium text-umber-700 hover:text-umber-600">
                            Forgot password?
                        </Link>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={form.processing}
                    className="btn btn-primary w-full"
                >
                    {form.processing ? 'Signing in...' : 'Sign in'}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-ink-500">
                Don't have an account?{' '}
                <Link href="/register" className="font-semibold text-umber-700 hover:text-umber-600">Create one</Link>
            </p>

            <div className="mt-6 rounded-lg bg-bone-50 p-4 text-xs text-ink-500">
                <p className="font-semibold text-ink-600">Demo accounts (password: password)</p>
                <p className="mt-1">admin@shopfront.test · staff@shopfront.test · customer@shopfront.test</p>
            </div>
        </AuthLayout>
    );
}
