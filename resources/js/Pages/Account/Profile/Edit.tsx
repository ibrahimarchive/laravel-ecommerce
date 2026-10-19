import { Head, useForm } from '@inertiajs/react';
import AccountLayout from '../../../Layouts/AccountLayout';

interface Profile {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
}

interface Props {
    profile: Profile;
}

export default function ProfileEdit({ profile }: Props) {
    const profileForm = useForm({
        name: profile.name ?? '',
        email: profile.email ?? '',
        phone: profile.phone ?? '',
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submitProfile = () => {
        profileForm.put('/account/profile', { preserveScroll: true });
    };

    const submitPassword = () => {
        passwordForm.put('/account/password', {
            preserveScroll: true,
            onSuccess: () => passwordForm.reset(),
        });
    };

    return (
        <AccountLayout>
            <Head title="My profile" />

            <h1 className="title text-2xl">Profile</h1>
            <p className="mt-1 text-sm text-ink-500">Manage your personal information and password.</p>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div className="card-surface p-6">
                    <h2 className="text-lg font-semibold text-ink-950">Personal information</h2>
                    <form className="mt-5 space-y-4" onSubmit={(e) => { e.preventDefault(); submitProfile(); }}>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-ink-700">Full name</label>
                            <input value={profileForm.data.name} onChange={(e) => profileForm.setData('name', e.target.value)} type="text" className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600" />
                            {profileForm.errors.name && <p className="mt-1 text-xs text-ink-700">{profileForm.errors.name}</p>}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-ink-700">Email address</label>
                            <input value={profileForm.data.email} onChange={(e) => profileForm.setData('email', e.target.value)} type="email" className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600" />
                            {profileForm.errors.email && <p className="mt-1 text-xs text-ink-700">{profileForm.errors.email}</p>}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-ink-700">Phone</label>
                            <input value={profileForm.data.phone} onChange={(e) => profileForm.setData('phone', e.target.value)} type="text" className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600" />
                            {profileForm.errors.phone && <p className="mt-1 text-xs text-ink-700">{profileForm.errors.phone}</p>}
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                            <button type="submit" disabled={profileForm.processing} className="btn btn-primary btn-sm">
                                Save changes
                            </button>
                            {profileForm.recentlySuccessful && <span className="text-sm font-medium text-umber-600">Saved</span>}
                        </div>
                    </form>
                </div>

                <div className="card-surface p-6">
                    <h2 className="text-lg font-semibold text-ink-950">Change password</h2>
                    <form className="mt-5 space-y-4" onSubmit={(e) => { e.preventDefault(); submitPassword(); }}>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-ink-700">Current password</label>
                            <input value={passwordForm.data.current_password} onChange={(e) => passwordForm.setData('current_password', e.target.value)} type="password" autoComplete="current-password" className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600" />
                            {passwordForm.errors.current_password && <p className="mt-1 text-xs text-ink-700">{passwordForm.errors.current_password}</p>}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-ink-700">New password</label>
                            <input value={passwordForm.data.password} onChange={(e) => passwordForm.setData('password', e.target.value)} type="password" autoComplete="new-password" className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600" />
                            {passwordForm.errors.password && <p className="mt-1 text-xs text-ink-700">{passwordForm.errors.password}</p>}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-ink-700">Confirm new password</label>
                            <input value={passwordForm.data.password_confirmation} onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)} type="password" autoComplete="new-password" className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600" />
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                            <button type="submit" disabled={passwordForm.processing} className="btn btn-primary btn-sm">
                                Update password
                            </button>
                            {passwordForm.recentlySuccessful && <span className="text-sm font-medium text-umber-600">Updated</span>}
                        </div>
                    </form>
                </div>
            </div>
        </AccountLayout>
    );
}
