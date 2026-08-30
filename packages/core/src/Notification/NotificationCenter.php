<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\Notification;

use EnpiiStudio\Core\Notification\Contracts\NotificationCenter as NotificationCenterContract;
use EnpiiStudio\Core\Notification\Models\Notification;
use Illuminate\Database\Eloquent\Model;

final class NotificationCenter implements NotificationCenterContract
{
    public function send(Model $notifiable, string $type, string $title, string $body, array $data = []): Notification
    {
        return Notification::query()->create([
            'notifiable_type' => $notifiable->getMorphClass(),
            'notifiable_id' => $notifiable->getKey(),
            'type' => $type,
            'title' => $title,
            'body' => $body,
            'data' => $data,
        ]);
    }

    public function markRead(Notification $notification): Notification
    {
        if ($notification->read_at === null) {
            $notification->read_at = now();
            $notification->save();
        }

        return $notification;
    }

    public function markAllReadFor(Model $notifiable): void
    {
        Notification::query()
            ->where('notifiable_type', $notifiable->getMorphClass())
            ->where('notifiable_id', $notifiable->getKey())
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }

    public function unreadCountFor(Model $notifiable): int
    {
        return (int) Notification::query()
            ->where('notifiable_type', $notifiable->getMorphClass())
            ->where('notifiable_id', $notifiable->getKey())
            ->whereNull('read_at')
            ->count();
    }
}
