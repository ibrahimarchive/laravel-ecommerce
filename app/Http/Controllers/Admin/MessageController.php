<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MessageController extends Controller
{
    /**
     * Display a paginated list of contact messages.
     */
    public function index(Request $request): Response
    {
        $filters = [
            'q' => $request->string('q')->trim()->value() ?: null,
            'status' => $request->string('status')->value() ?: 'unread',
        ];

        $messages = ContactMessage::query()
            ->when($filters['q'], function ($query, $term): void {
                $query->where(function ($query) use ($term): void {
                    $query->where('name', 'like', "%{$term}%")
                        ->orWhere('email', 'like', "%{$term}%")
                        ->orWhere('subject', 'like', "%{$term}%");
                });
            })
            ->when($filters['status'] === 'unread', fn ($query) => $query->where('is_read', false))
            ->when($filters['status'] === 'read', fn ($query) => $query->where('is_read', true))
            ->latest('id')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Messages/Index', [
            'messages' => $messages->through(fn (ContactMessage $message): array => [
                'id' => $message->id,
                'name' => $message->name,
                'email' => $message->email,
                'phone' => $message->phone,
                'subject' => $message->subject,
                'is_read' => (bool) $message->is_read,
                'replied_at' => $message->replied_at?->toIso8601String(),
                'created_at' => $message->created_at->toIso8601String(),
            ]),
            'filters' => $filters,
            'stats' => [
                'unread' => ContactMessage::query()->where('is_read', false)->count(),
                'total' => ContactMessage::query()->count(),
            ],
        ]);
    }

    /**
     * Display the given message.
     */
    public function show(ContactMessage $message): Response
    {
        if (! $message->is_read) {
            $message->markAsRead();
        }

        return Inertia::render('Admin/Messages/Show', [
            'message' => [
                'id' => $message->id,
                'name' => $message->name,
                'email' => $message->email,
                'phone' => $message->phone,
                'subject' => $message->subject,
                'message' => $message->message,
                'is_read' => (bool) $message->is_read,
                'replied_at' => $message->replied_at?->toIso8601String(),
                'created_at' => $message->created_at->toIso8601String(),
            ],
        ]);
    }

    /**
     * Mark the given message as replied.
     */
    public function markReplied(ContactMessage $message): RedirectResponse
    {
        $message->markAsReplied();

        return back()->with('success', 'Message marked as replied.');
    }

    /**
     * Delete the given message.
     */
    public function destroy(ContactMessage $message): RedirectResponse
    {
        $message->delete();

        return redirect()
            ->route('admin.messages.index')
            ->with('success', 'Message deleted.');
    }
}
