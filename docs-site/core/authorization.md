---
title: Authorization
---

# Authorization

Authorization menyediakan service terpusat dan Gate Laravel `enpii.permission`. Permissions bersifat global, sedangkan penugasan role terjadi di dalam konteks tenant aktif. Guard permission fail-closed dan tidak dilonggarkan.

## API Service

Implementasi asli `AuthorizationService` mengekspos tiga operasi utama:

```php
assignRole(User $user, Role $role): void
grantPermission(Role $role, Permission $permission): void
allow(User $user, string $permission): bool
```

Service mengambil `TenantContext` dari container.

## Contoh Asli

```php
use EnpiiStudio\Core\Authorization\AuthorizationService;

$context->run($tenantA, fn () => app(AuthorizationService::class)->assignRole($user, $role));
```

Pola ini berasal dari `packages/core/tests/CoreBehaviorTest.php`.

## Konsumsi di Aplikasi

```php
public function authorize(): bool
{
    return Gate::allows('enpii.permission', 'media.create');
}
```

FormRequest atau controller harus memakai Gate yang sama agar keputusan permission konsisten.
