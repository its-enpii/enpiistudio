<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\Authorization;

use EnpiiStudio\Core\Authorization\Models\Permission;
use EnpiiStudio\Core\Authorization\Models\Role;
use EnpiiStudio\Core\Identity\Models\User;
use EnpiiStudio\Core\Tenancy\TenantContext;
use InvalidArgumentException;

final readonly class AuthorizationService
{
    public function __construct(private TenantContext $context) {}

    public function assignRole(User $user, Role $role): void
    {
        if (! $user->exists || ! $role->exists) {
            throw new InvalidArgumentException('User and role must be persisted before assignment.');
        }

        $tenantId = $this->context->id();
        $this->context->assertMatches((string) $user->tenant_id);
        $this->context->assertMatches((string) $role->tenant_id);

        $user->roles()->syncWithoutDetaching([
            $role->getKey() => ['tenant_id' => $tenantId],
        ]);
    }

    public function grantPermission(Role $role, Permission $permission): void
    {
        if (! $role->exists || ! $permission->exists) {
            throw new InvalidArgumentException('Role and permission must be persisted before assignment.');
        }

        $this->context->assertMatches((string) $role->tenant_id);
        $role->permissions()->syncWithoutDetaching([$permission->getKey()]);
    }

    public function allow(User $user, string $permission): bool
    {
        if ($user->status !== 'active') {
            return false;
        }

        $permission = trim($permission);

        if ($permission === '') {
            throw new InvalidArgumentException('Permission slug must not be empty.');
        }

        $this->context->assertMatches((string) $user->tenant_id);

        return $user->hasPermission($permission);
    }
}
