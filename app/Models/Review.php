<?php

namespace App\Models;

use Database\Factories\ReviewFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'product_id', 'user_id', 'author_name', 'author_email',
    'rating', 'title', 'body', 'is_approved', 'approved_at',
])]
class Review extends Model
{
    /** @use HasFactory<ReviewFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'rating' => 'integer',
            'is_approved' => 'boolean',
            'approved_at' => 'datetime',
        ];
    }

    /**
     * Get the product the review belongs to.
     *
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the user who wrote the review.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope the query to approved reviews.
     *
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    #[Scope]
    protected function approved(Builder $query): Builder
    {
        return $query->where('is_approved', true);
    }

    /**
     * Scope the query to reviews awaiting moderation.
     *
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    #[Scope]
    protected function pending(Builder $query): Builder
    {
        return $query->where('is_approved', false);
    }

    /**
     * Approve the review and record the moderation timestamp.
     */
    public function approve(): void
    {
        $this->forceFill([
            'is_approved' => true,
            'approved_at' => now(),
        ])->save();
    }

    /**
     * Reject the review and return it to the moderation queue.
     */
    public function reject(): void
    {
        $this->forceFill([
            'is_approved' => false,
            'approved_at' => null,
        ])->save();
    }
}
