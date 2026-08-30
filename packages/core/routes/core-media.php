<?php

declare(strict_types=1);

use EnpiiStudio\Core\Media\Http\Controllers\MediaController;
use Illuminate\Support\Facades\Route;

Route::prefix('api/v1/media')
    ->middleware(['tenant', 'api'])
    ->group(function (): void {
        Route::get('/', [MediaController::class, 'index'])->name('media.index');
        Route::post('/', [MediaController::class, 'store'])->name('media.store');
        Route::get('/{media}', [MediaController::class, 'show'])->name('media.show');
        Route::put('/{media}', [MediaController::class, 'update'])->name('media.update');
        Route::patch('/{media}', [MediaController::class, 'update'])->name('media.update');
        Route::delete('/{media}', [MediaController::class, 'destroy'])->name('media.destroy');
    });
