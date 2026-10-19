<?php

namespace App\Http\Controllers;

use App\Models\NewsletterSubscriber;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class NewsletterController extends Controller
{
    /**
     * Subscribe an email address to the newsletter.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email', 'max:255'],
            'name' => ['nullable', 'string', 'max:255'],
        ]);

        NewsletterSubscriber::subscribe($validated['email'], $validated['name'] ?? null);

        return back()->with('success', 'You are now subscribed to our newsletter.');
    }

    /**
     * Unsubscribe using the token from a newsletter email.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'token' => ['required', 'string'],
        ]);

        $subscriber = NewsletterSubscriber::query()
            ->where('token', $validated['token'])
            ->firstOrFail();

        $subscriber->unsubscribe();

        return redirect()->route('home')->with('success', 'You have been unsubscribed from our newsletter.');
    }
}
