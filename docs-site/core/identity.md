---
title: Identity
---

# Identity

Identity menyediakan fondasi pengguna tenant di `packages/core/src/Identity`. Model `User` memakai UUID dan mengikuti pola model Eloquent lain di core. Authorization dan model domain kemudian bekerja dari user ini sebagai aktor.

## Titik Integrasi

- Aplikasi konsumen memetakan identitas login ke user dan `tenant_id`.
- Resolver tenancy hanya membaca sumber identitas aplikasi, misalnya `Auth::user()->tenant_id`.
- Permission dan role dikelola di module Authorization, bukan langsung di controller.

## Contoh Runtime

```php
use EnpiiStudio\Core\Authorization\AuthorizationService;

$authorization = app(AuthorizationService::class);
$allowed = $authorization->allow($user, 'media.create');
```

Contoh authorization diambil dari penggunaan module Authorization. Karena authorization mengandalkan konteks tenant aktif, pastikan request sudah dibungkus middleware tenancy.
