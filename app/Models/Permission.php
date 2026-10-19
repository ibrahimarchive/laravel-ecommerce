<?php

namespace App\Models;

use Database\Factories\PermissionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable(['name', 'slug', 'group'])]
class Permission extends Model
{
    /** @use HasFactory<PermissionFactory> */
    use HasFactory;

    /**
     * Get the roles that hold the permission.
     *
     * @return BelongsToMany<Role, $this>
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class)->withTimestamps();
    }

    /**
     * Scope the query to permissions in the given group.
     *
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    #[Scope]
    protected function inGroup(Builder $query, string $group): Builder
    {
        return $query->where('group', $group);
    }
}
