<?php

declare(strict_types=1);

use Illuminate\Support\ServiceProvider;

return [
    'name' => env('APP_NAME', 'Enpii WhatsApp Gateway'),
    'env' => env('APP_ENV', 'production'),
    'debug' => (bool) env('APP_DEBUG', false),
    'url' => env('APP_URL', 'http://localhost:8090'),
    'timezone' => 'UTC',
    'locale' => 'en',
    'fallback_locale' => 'en',
    'faker_locale' => 'en_US',
    'key' => env('APP_KEY'),
    'previous_keys' => [],
    'cipher' => 'AES-256-CBC',
    'maintenance' => ['driver' => 'file', 'store' => 'database'],
    'providers' => ServiceProvider::defaultProviders()->toArray(),
];
