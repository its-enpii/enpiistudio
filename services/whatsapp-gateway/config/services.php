<?php

declare(strict_types=1);

return [
    'evolution' => [
        'driver' => env('EVOLUTION_API_DRIVER', 'http'),
        'url' => env('EVOLUTION_API_URL'),
        'api_key' => env('EVOLUTION_API_KEY'),
        'timeout' => (int) env('EVOLUTION_API_TIMEOUT', 10),
    ],
    'gateway' => [
        'rate_limit' => (int) env('GATEWAY_RATE_LIMIT', 60),
    ],
];
