<?php

declare(strict_types=1);

use EnpiiStudio\Core\Notification\Http\Controllers\NotificationController;
use EnpiiStudio\Core\Tenancy\Middleware\ResolveTenantContext;
use Illuminate\Support\Facades\Route;

Route::prefix('api/v1/notifications')
    ->middleware([ResolveTenantContext::class, 'auth'])
    ->group(function (): void {
        Route::get('/', [NotificationController::class, 'index'])->name('notification.index');
        Route::get('unread-count', [NotificationController::class, 'unreadCount'])->name('notification.unread-count');
        Route::post('{id}/mark-read', [NotificationController::class, 'markRead'])->name('notification.mark-read');
        Route::post('mark-all-read', [NotificationController::class, 'markAllRead'])->name('notification.mark-all-read');
    });
