<?php

declare(strict_types=1);

use EnpiiStudio\WhatsAppGateway\Controllers\HealthController;
use EnpiiStudio\WhatsAppGateway\Controllers\InstanceController;
use EnpiiStudio\WhatsAppGateway\Controllers\MessageController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::get('/health', [HealthController::class, 'health']);
    Route::get('/ready', [HealthController::class, 'ready']);

    Route::middleware(['gateway.auth', 'throttle:gateway'])->group(function (): void {
        Route::get('/instances/{instanceId}/status', [InstanceController::class, 'status']);
        Route::post('/instances/{instanceId}/connect', [InstanceController::class, 'connect']);
        Route::post('/instances/{instanceId}/disconnect', [InstanceController::class, 'disconnect']);
        Route::post('/messages/text', [MessageController::class, 'text']);
        Route::post('/messages/media', [MessageController::class, 'media']);
    });
});
