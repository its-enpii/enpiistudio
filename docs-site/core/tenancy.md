---
title: Tenancy
---

# Tenancy

Tenancy bersifat fail-closed. Setiap request dijalankan dalam konteks tenant oleh middleware, dan setiap model dengan `BelongsToTenant` difilter serta divalidasi terhadap konteks tersebut.

## Kontrak `TenantContext`

```php
set(string $tenantId): void
id(): string
has(): bool
assertMatches(string $tenantId): void
forget(): void
run(string $tenantId, Closure $callback): mixed
```

`set()` menolak ID tenant kosong. `id()` melempar `TenantContextMissing` bila konteks belum tersedia. `assertMatches()` memakai `hash_equals()` dan melempar `TenantMismatch` bila ID berbeda. `run()` menyimpan konteks sebelumnya dan memulihkannya di `finally`, sehingga aman untuk pemanggilan bersarang dan exception.

## Request Resolver

Aplikasi konsumen menyediakan resolver dan alias middleware:

```php
use EnpiiStudio\Core\Tenancy\Contracts\TenantResolver;
use EnpiiStudio\Core\Tenancy\Middleware\ResolveTenantContext;
use Illuminate\Foundation\Configuration\Middleware;

$app->singleton(TenantResolver::class, ProductTenantResolver::class);

$middleware->alias([
    'tenant' => ResolveTenantContext::class,
]);
```

Contoh di atas berasal dari dokumentasi implementasi aktif monorepo; class `ProductTenantResolver` milik aplikasi konsumen, bukan core.

## Model Bertenant

```php
use EnpiiStudio\Core\Tenancy\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

final class Invoice extends Model
{
    use BelongsToTenant;
}
```

Implementasi `BelongsToTenant` asli memasang `TenantScope`, mengisi `tenant_id` saat model dibuat, serta memvalidasi atribut pada event model. Kolom tenant defaultnya adalah `tenant_id`.

## Batas Perlindungan

| Jalur | Perlindungan aktif |
| --- | --- |
| Query Eloquent biasa | Global scope menambahkan filter tenant |
| Hydration model tanpa scope | Event `retrieved` tetap memeriksa tenant |
| Save, delete, replicate, fresh, refresh | Lifecycle assertion menolak model tenant lain |
| Bulk update, raw query, query builder | Filter tenant wajib ditulis eksplisit |
| Quiet methods atau `withoutEvents` | Dapat melewati assertion berbasis event |

Tidak ada bypass administrator implisit. Operasi lintas tenant harus eksplisit, dibatasi, dan diuji tersendiri.
