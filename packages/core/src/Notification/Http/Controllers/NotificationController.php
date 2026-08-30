<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\Notification\Http\Controllers;

use EnpiiStudio\Core\Notification\Contracts\NotificationCenter;
use EnpiiStudio\Core\Notification\Http\Resources\NotificationResource;
use EnpiiStudio\Core\Notification\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpKernel\Exception\HttpException;

final class NotificationController
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $request->validate(['unread' => ['nullable', 'boolean']]);

        $notifications = Notification::query()
            ->where('notifiable_type', $request->user()->getMorphClass())
            ->where('notifiable_id', $request->user()->getKey())
            ->when($request->boolean('unread'), fn ($query) => $query->whereNull('read_at'))
            ->latest()
            ->paginate(25);

        return NotificationResource::collection($notifications)->additional([
            'meta' => ['locale' => app()->getLocale()],
        ]);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        return response()->json(['count' => app(NotificationCenter::class)->unreadCountFor($request->user())]);
    }

    public function markRead(Request $request, string $id): NotificationResource
    {
        $notification = Notification::query()->findOrFail($id);
        $this->assertOwnedByUser($request, $notification);

        return new NotificationResource(app(NotificationCenter::class)->markRead($notification));
    }

    public function markAllRead(Request $request): JsonResponse
    {
        app(NotificationCenter::class)->markAllReadFor($request->user());

        return response()->json(['count' => 0]);
    }

    private function assertOwnedByUser(Request $request, Notification $notification): void
    {
        if ((string) $notification->notifiable_id !== (string) $request->user()->getKey()) {
            throw new HttpException(404);
        }
    }
}
