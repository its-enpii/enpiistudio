<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\Notification\Contracts;

use EnpiiStudio\Core\Notification\Models\Notification;
use Illuminate\Database\Eloquent\Model;

interface NotificationCenter
{
    public function send(Model $notifiable, string $type, string $title, string $body, array $data = []): Notification;

    public function markRead(Notification $notification): Notification;

    public function markAllReadFor(Model $notifiable): void;

    public function unreadCountFor(Model $notifiable): int;
}
