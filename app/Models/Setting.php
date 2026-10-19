<?php

namespace App\Models;

use Database\Factories\SettingFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

#[Fillable(['key', 'value', 'group'])]
class Setting extends Model
{
    /** @use HasFactory<SettingFactory> */
    use HasFactory;

    /**
     * The cache key used to store the resolved settings map.
     */
    private const CACHE_KEY = 'settings.all';

    /**
     * Forget the cached settings when the model changes.
     */
    protected static function booted(): void
    {
        $forget = static fn () => Cache::forget(self::CACHE_KEY);

        static::saved($forget);
        static::deleted($forget);
    }

    /**
     * Scope the query to settings in the given group.
     *
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    #[Scope]
    protected function inGroup(Builder $query, string $group): Builder
    {
        return $query->where('group', $group);
    }

    /**
     * Resolve a setting value, falling back to the provided default.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        return self::allSettings()->get($key) ?? $default;
    }

    /**
     * Persist a setting value, creating the record when it does not exist.
     */
    public static function set(string $key, mixed $value, string $group = 'general'): void
    {
        self::updateOrCreate(
            ['key' => $key],
            ['value' => is_scalar($value) || $value === null ? $value : json_encode($value), 'group' => $group],
        );
    }

    /**
     * Get all settings keyed by their name, cached for the configured duration.
     *
     * The map is cached as a plain array so the cache payload never contains an
     * object with protected properties, which the database store cannot round
     * trip reliably.
     *
     * @return Collection<string, string|null>
     */
    public static function allSettings(): Collection
    {
        $settings = Cache::rememberForever(
            self::CACHE_KEY,
            fn (): array => self::query()->pluck('value', 'key')->all(),
        );

        return collect($settings);
    }
}
