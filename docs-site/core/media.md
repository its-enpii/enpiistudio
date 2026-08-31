---
title: Media
---

# Media

Media mengelola unggahan berkas dengan storage abstraction dan semua metadata media terikat tenant. Runtime aslinya menggunakan Laravel Storage.

## API Asli

```php
upload(UploadedFile $file, array $attrs = []): Media
delete(Media $media): bool
url(Media $media): string
```

## Contoh Asli

```php
use EnpiiStudio\Core\Media\MediaManager;
use EnpiiStudio\Core\Tenancy\TenantContext;
use Illuminate\Http\UploadedFile;

app(TenantContext::class)->run($tenantId, function () use ($file) {
    $media = app(MediaManager::class)->upload($file, [
        'collection' => 'invoices',
    ]);

    return app(MediaManager::class)->url($media);
});
```

Contoh URL berasal dari `packages/core/tests/MediaTest.php`; test memastikan URL mengikuti storage disk terkait.
