<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use App\Services\CartService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Create a new customer account and sign them in.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:30'],
            'password' => ['required', 'string', 'confirmed', Password::defaults()],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => $validated['password'],
        ]);

        if ($role = Role::query()->where('slug', Role::CUSTOMER_SLUG)->first()) {
            $user->roles()->syncWithoutDetaching($role->id);
        }

        $guestSessionId = $request->session()->getId();

        event(new Registered($user));

        Auth::login($user);

        $request->session()->regenerate();

        app(CartService::class)->mergeGuestCart($user, $guestSessionId);

        return redirect()->route('home')->with('success', 'Your account has been created. Welcome!');
    }
}
