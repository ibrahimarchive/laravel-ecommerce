import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import type { PageProps } from '../../../types';

type SettingValue = string | number | boolean | null;

interface SettingsGroup {
    name: string;
    label: string;
    keys: string[];
}

interface Props extends PageProps {
    settings: Record<string, SettingValue>;
    groups: SettingsGroup[];
}

const booleanKeys = ['tax_inclusive', 'reviews_require_approval', 'allow_guest_checkout', 'send_order_confirmation'];
const textareaKeys = ['store_description', 'store_address'];

export default function SettingsEdit({ settings = {}, groups = [] }: Props) {
    const form = useForm({ settings: { ...settings } });

    function isBoolean(key: string) {
        return booleanKeys.includes(key);
    }

    function isTextarea(key: string) {
        return textareaKeys.includes(key);
    }

    function label(key: string) {
        return key
            .replace(/_url$/, '')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (character) => character.toUpperCase());
    }

    function isTrue(key: string) {
        const value = form.data.settings[key];
        return value === true || value === '1' || value === 1;
    }

    function setSetting(key: string, value: SettingValue) {
        form.setData('settings', { ...form.data.settings, [key]: value });
    }

    function toggleBoolean(key: string) {
        setSetting(key, isTrue(key) ? '0' : '1');
    }

    function submit() {
        form.put('/admin/settings', { preserveScroll: true });
    }

    const errors = form.errors as Record<string, string | undefined>;

    return (
        <AdminLayout>
            <Head title="Settings" />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="title text-2xl">Settings</h1>
                    <p className="mt-1 text-sm text-ink-500">Store configuration, currency, tax, and shipping.</p>
                </div>
                <button type="button" disabled={form.processing} className="btn btn-primary btn-sm" onClick={submit}>
                    Save settings
                </button>
            </div>

            <div className="mt-6 space-y-6">
                {groups.map((group) => (
                    <div key={group.name} className="card-surface p-6">
                        <h2 className="text-base font-semibold text-ink-950">{group.label}</h2>

                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            {group.keys.map((key) => (
                                <div key={key} className={isTextarea(key) || isBoolean(key) ? 'sm:col-span-2' : ''}>
                                    <label className="mb-1 block text-sm font-medium text-ink-700">{label(key)}</label>

                                    {isBoolean(key) ? (
                                        <label className="flex items-center gap-2 text-sm text-ink-700">
                                            <input
                                                type="checkbox"
                                                checked={isTrue(key)}
                                                className="rounded border-bone-400 text-umber-700 focus:ring-umber-600"
                                                onChange={() => toggleBoolean(key)}
                                            />
                                            Enabled
                                        </label>
                                    ) : isTextarea(key) ? (
                                        <textarea
                                            value={(form.data.settings[key] ?? '') as string}
                                            onChange={(e) => setSetting(key, e.target.value)}
                                            rows={3}
                                            className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                                        ></textarea>
                                    ) : (
                                        <input
                                            value={(form.data.settings[key] ?? '') as string}
                                            onChange={(e) => setSetting(key, e.target.value)}
                                            type="text"
                                            className="w-full rounded-lg border border-bone-400 px-3 py-2 text-sm focus:border-umber-600 focus:ring-1 focus:ring-umber-600"
                                        />
                                    )}

                                    {errors[`settings.${key}`] ? <p className="mt-1 text-xs text-ink-700">{errors[`settings.${key}`]}</p> : null}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6">
                <button type="button" disabled={form.processing} className="btn btn-primary" onClick={submit}>
                    Save settings
                </button>
            </div>
        </AdminLayout>
    );
}
