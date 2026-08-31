---
title: Notification
---

# Notification

Notification adalah pusat notifikasi in-app per tenant dengan status baca. API-nya terseleksi dan tidak menggantikan channel eksternal seperti WhatsApp.

## API Asli

```php
send(Model $notifiable, string $type, string $title, string $body, array $data = []): Notification
markRead(Notification $notification): Notification
markAllReadFor(Model $notifiable): void
unreadCountFor(Model $notifiable): int
```

## Contoh Penggunaan

```php
use EnpiiStudio\Core\Notification\NotificationCenter;

app(NotificationCenter::class)->send(
    $user,
    'order.completed',
    'Pesanan selesai',
    'Pesanan #123 sudah siap.',
    ['order_id' => 123]
);
```

Gunakan `unreadCountFor()` untuk badge UI dan `markAllReadFor()` untuk tindakan tandai semua.
