<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    /**
     * Show the store settings form.
     */
    public function edit(): Response
    {
        $settings = Setting::query()
            ->orderBy('group')
            ->orderBy('key')
            ->get(['key', 'value', 'group']);

        return Inertia::render('Admin/Settings/Edit', [
            'settings' => $settings->mapWithKeys(fn (Setting $setting): array => [$setting->key => $setting->value]),
            'groups' => $settings
                ->groupBy('group')
                ->map(fn ($group, $name): array => [
                    'name' => $name,
                    'label' => ucfirst($name),
                    'keys' => $group->pluck('key')->values(),
                ])
                ->values(),
        ]);
    }

    /**
     * Update the store settings.
     */
    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'settings' => ['required', 'array'],
            'settings.*' => ['nullable', 'string'],
        ]);

        foreach ($data['settings'] as $key => $value) {
            $setting = Setting::query()->where('key', $key)->first();

            if ($setting === null) {
                continue;
            }

            Setting::set($key, $value, $setting->group);
        }

        return back()->with('success', 'Settings updated successfully.');
    }
}
