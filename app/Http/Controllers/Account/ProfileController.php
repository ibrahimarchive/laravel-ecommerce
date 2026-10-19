<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the profile settings form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Account/Profile/Edit', [
            'profile' => [
                'name' => $request->user()->name,
                'email' => $request->user()->email,
                'phone' => $request->user()->phone,
                'avatar' => $request->user()->avatar,
            ],
        ]);
    }

    /**
     * Update the customer's profile details.
     */
    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:30'],
        ]);

        $user->fill($validated);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return back()->with('success', 'Your profile has been updated.');
    }

    /**
     * Update the customer's password.
     */
    public function updatePassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'string', 'confirmed', Password::defaults()],
        ]);

        $request->user()->update([
            'password' => $validated['password'],
        ]);

        return back()->with('success', 'Your password has been updated.');
    }
}
