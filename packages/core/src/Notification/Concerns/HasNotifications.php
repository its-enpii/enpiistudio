<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\Notification\Concerns;

use EnpiiStudio\Core\Notification\Models\Notification;
use Illuminate\Database\Eloquent\Relations\MorphMany;

trait HasNotifications
{
    public function inAppNotifications(): MorphMany
    {
        return $this->morphMany(Notification::class, 'notifiable');
    }

    public function unreadCount(): int
    {
        return (int) $this->inAppNotifications()->whereNull('read_at')->count();
    }

    public function markAllRead(): void
    {
        $this->inAppNotifications()->whereNull('read_at')->update(['read_at' => now()]);
    }
}
