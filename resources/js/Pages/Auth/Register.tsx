import { Link, useForm } from '@inertiajs/react';
import AuthLayout from '../../Layouts/AuthLayout';

export default function Register() {
    const form = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
    });

    const submit = () => {
        form.post('/register', {
            onFinish: () => form.reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title="Create your account">
            <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); submit(); }}>
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-ink-700">Full name</label>
                    <input
                        id="name"
                        value={form.data.name}
                        onChange={(e) => form.setData('name', e.target.value)}
                        type="text"
                        autoComplete="name"
                        autoFocus
                        className="mt-1 w-full rounded-lg border border-bone-400 px-3 py-2.5 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                    />
                    {form.errors.name && <p className="mt-1 text-xs text-ink-700">{form.errors.name}</p>}
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-ink-700">Email</label>
                    <input
                        id="email"
                        value={form.data.email}
                        onChange={(e) => form.setData('email', e.target.value)}
                        type="email"
                        autoComplete="username"
                        className="mt-1 w-full rounded-lg border border-bone-400 px-3 py-2.5 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                    />
                    {form.errors.email && <p className="mt-1 text-xs text-ink-700">{form.errors.email}</p>}
                </div>

                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-ink-700">Phone <span className="text-ink-400">(optional)</span></label>
                    <input
                        id="phone"
                        value={form.data.phone}
                        onChange={(e) => form.setData('phone', e.target.value)}
                        type="text"
                        autoComplete="tel"
                        className="mt-1 w-full rounded-lg border border-bone-400 px-3 py-2.5 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                    />
                    {form.errors.phone && <p className="mt-1 text-xs text-ink-700">{form.errors.phone}</p>}
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-ink-700">Password</label>
                    <input
                        id="password"
                        value={form.data.password}
                        onChange={(e) => form.setData('password', e.target.value)}
                        type="password"
                        autoComplete="new-password"
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
                    {form.processing ? 'Creating account...' : 'Create account'}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-ink-500">
                Already registered?{' '}
                <Link href="/login" className="font-semibold text-umber-700 hover:text-umber-600">Sign in</Link>
            </p>
        </AuthLayout>
    );
}
