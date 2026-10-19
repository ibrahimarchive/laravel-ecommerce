<?php

namespace App\Models;

use Database\Factories\NewsletterSubscriberFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

#[Fillable([
    'email', 'name', 'token',
    'is_active', 'subscribed_at', 'unsubscribed_at',
])]
class NewsletterSubscriber extends Model
{
    /** @use HasFactory<NewsletterSubscriberFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'subscribed_at' => 'datetime',
            'unsubscribed_at' => 'datetime',
        ];
    }

    /**
     * Scope the query to active subscribers.
     *
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    #[Scope]
    protected function active(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Subscribe the given email address, reactivating an existing record when present.
     */
    public static function subscribe(string $email, ?string $name = null): self
    {
        $subscriber = self::query()->firstOrNew(['email' => $email]);

        $subscriber->fill([
            'name' => $name ?? $subscriber->name,
            'token' => $subscriber->token ?? Str::random(64),
            'is_active' => true,
            'subscribed_at' => $subscriber->subscribed_at ?? now(),
            'unsubscribed_at' => null,
        ])->save();

        return $subscriber;
    }

    /**
     * Mark the subscriber as unsubscribed.
     */
    public function unsubscribe(): bool
    {
        return $this->forceFill([
            'is_active' => false,
            'unsubscribed_at' => now(),
        ])->save();
    }
}
