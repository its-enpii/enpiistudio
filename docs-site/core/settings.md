---
title: Settings
---

# Settings

Settings menyimpan konfigurasi runtime per tenant. Repository hanya menyediakan operasi baca dan tulis, sehingga interpretasi tipe data dan penggunaannya tetap milik module atau aplikasi konsumen.

## API Asli

```php
get(string $key, mixed $default = null): mixed
set(string $key, mixed $value): Setting
```

## Contoh Penggunaan

```php
use EnpiiStudio\Core\Settings\SettingsRepository;

$settings = app(SettingsRepository::class);
$invoicePrefix = $settings->get('invoice.prefix', 'INV-');
$settings->set('invoice.prefix', 'LAUNDRY-');
```

Karena repository mengandalkan tenant aktif, jalankan kode di dalam middleware `tenant` atau `TenantContext::run()`.
