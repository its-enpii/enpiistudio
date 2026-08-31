---
title: Audit
---

# Audit

Audit merekam perubahan model dan tindakan penting sebagai audit log yang terikat tenant. Trait `Auditable` mengotomatisasi pencatatan, sedangkan `AuditWriter` digunakan untuk pencatatan eksplisit.

## Audit Eksplisit

```php
record(
    string $action,
    Model $subject,
    array $before = [],
    array $after = [],
    array $metadata = []
): AuditLog
```

## Contoh Asli

```php
use EnpiiStudio\Core\Audit\AuditWriter;

app(AuditWriter::class)->record(
    'pos.order.void',
    $order,
    $order->getOriginal(),
    ['status' => 'void'],
    ['reason' => 'customer-request']
);
```

Pola `AuditWriter` juga muncul di log progres monorepo untuk operasi domain POS. Trait `Auditable` digunakan pada model yang ingin dicatat otomatis.
