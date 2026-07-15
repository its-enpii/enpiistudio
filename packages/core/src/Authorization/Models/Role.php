<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\Authorization\Models;

use EnpiiStudio\Core\Identity\Models\User;
use EnpiiStudio\Core\Tenancy\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

final class Role extends Model
{
    use BelongsToTenant;
    use HasUuids;

    protected $table = 'core_roles';

    protected $fillable = ['name', 'slug'];

    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'core_permission_role');
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'core_role_user')->withPivot('tenant_id');
    }
}
