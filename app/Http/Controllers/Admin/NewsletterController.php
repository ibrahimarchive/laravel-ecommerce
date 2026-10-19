<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NewsletterController extends Controller
{
    /**
     * Display a paginated list of newsletter subscribers.
     */
    public function index(Request $request): Response
    {
        $filters = [
            'q' => $request->string('q')->trim()->value() ?: null,
            'status' => $request->string('status')->value() ?: 'active',
        ];

        $subscribers = NewsletterSubscriber::query()
            ->when($filters['q'], fn ($query, $term) => $query->where('email', 'like', "%{$term}%")->orWhere('name', 'like', "%{$term}%"))
            ->when($filters['status'] === 'active', fn ($query) => $query->where('is_active', true))
            ->when($filters['status'] === 'inactive', fn ($query) => $query->where('is_active', false))
            ->latest('id')
            ->paginate(30)
            ->withQueryString();

        return Inertia::render('Admin/Newsletter/Index', [
            'subscribers' => $subscribers->through(fn (NewsletterSubscriber $subscriber): array => [
                'id' => $subscriber->id,
                'email' => $subscriber->email,
                'name' => $subscriber->name,
                'is_active' => (bool) $subscriber->is_active,
                'subscribed_at' => $subscriber->subscribed_at?->toIso8601String(),
                'unsubscribed_at' => $subscriber->unsubscribed_at?->toIso8601String(),
            ]),
            'filters' => $filters,
            'stats' => [
                'active' => NewsletterSubscriber::query()->where('is_active', true)->count(),
                'inactive' => NewsletterSubscriber::query()->where('is_active', false)->count(),
            ],
        ]);
    }

    /**
     * Delete the given subscriber.
     */
    public function destroy(NewsletterSubscriber $subscriber): RedirectResponse
    {
        $email = $subscriber->email;
        $subscriber->delete();

        return back()->with('success', "Subscriber \"{$email}\" removed.");
    }
}
