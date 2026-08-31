---
title: FeatureFlags
---

# FeatureFlags

FeatureFlags menyediakan sakelar fitur per tenant untuk peluncuran bertahap dan paket fitur. API sengaja sederhana dan boolean-first.

## API Asli

```php
enabled(string $key): bool
set(string $key, bool $enabled): FeatureFlag
```

## Contoh Penggunaan

```php
use EnpiiStudio\Core\FeatureFlags\FeatureFlags;

$flags = app(FeatureFlags::class);

if ($flags->enabled('notification.whatsapp')) {
    // aktifkan jalur notifikasi WhatsApp
}
```

Flag dibaca dari konteks tenant aktif. Jangan baca flag di luar request yang telah menyelesaikan tenancy.
