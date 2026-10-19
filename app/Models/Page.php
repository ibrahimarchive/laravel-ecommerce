<?php

namespace App\Models;

use Database\Factories\PageFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

#[Fillable([
    'title', 'slug', 'excerpt', 'content',
    'meta_title', 'meta_description',
    'is_published', 'show_in_footer', 'published_at', 'sort_order',
])]
class Page extends Model
{
    /** @use HasFactory<PageFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
            'show_in_footer' => 'boolean',
            'published_at' => 'datetime',
            'sort_order' => 'integer',
        ];
    }

    /**
     * Scope the query to published pages.
     *
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    #[Scope]
    protected function published(Builder $query): Builder
    {
        return $query->where('is_published', true)
            ->where(function (Builder $query) {
                $query->whereNull('published_at')
                    ->orWhere('published_at', '<=', now());
            });
    }

    /**
     * Scope the query to pages shown in the footer.
     *
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    #[Scope]
    protected function inFooter(Builder $query): Builder
    {
        return $query->where('show_in_footer', true);
    }

    /**
     * Scope the query to an ordered, deterministic sequence.
     *
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    #[Scope]
    protected function ordered(Builder $query): Builder
    {
        return $query->orderBy('sort_order')->orderBy('title');
    }

    /**
     * Generate a unique slug from the given title.
     */
    public static function generateSlug(string $title, ?int $ignoreId = null): string
    {
        $base = Str::slug($title);
        $slug = $base;
        $suffix = 2;

        while (self::query()
            ->where('slug', $slug)
            ->when($ignoreId !== null, fn (Builder $query) => $query->whereKeyNot($ignoreId))
            ->exists()
        ) {
            $slug = "{$base}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }
}
