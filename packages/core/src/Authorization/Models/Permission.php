<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\Authorization\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

final class Permission extends Model
{
    use HasUuids;

    protected $table = 'core_permissions';

    protected $fillable = ['name', 'slug'];

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'core_permission_role');
    }
}
