<?php

namespace App\Models;

use Database\Factories\ContactMessageFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'name', 'email', 'phone', 'subject', 'message',
    'is_read', 'replied_at',
])]
class ContactMessage extends Model
{
    /** @use HasFactory<ContactMessageFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_read' => 'boolean',
            'replied_at' => 'datetime',
        ];
    }

    /**
     * Scope the query to unread messages.
     *
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    #[Scope]
    protected function unread(Builder $query): Builder
    {
        return $query->where('is_read', false);
    }

    /**
     * Scope the query to messages still awaiting a reply.
     *
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    #[Scope]
    protected function awaitingReply(Builder $query): Builder
    {
        return $query->whereNull('replied_at');
    }

    /**
     * Mark the message as read.
     */
    public function markAsRead(): bool
    {
        return $this->forceFill(['is_read' => true])->save();
    }

    /**
     * Mark the message as replied to.
     */
    public function markAsReplied(): bool
    {
        return $this->forceFill([
            'is_read' => true,
            'replied_at' => now(),
        ])->save();
    }
}
