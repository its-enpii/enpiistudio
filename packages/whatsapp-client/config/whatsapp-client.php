<?php

declare(strict_types=1);

return [
    'url' => env('ENPII_WHATSAPP_GATEWAY_URL', 'http://localhost:8090/api/v1'),
    'api_key' => env('ENPII_WHATSAPP_GATEWAY_KEY'),
    'timeout' => (int) env('ENPII_WHATSAPP_GATEWAY_TIMEOUT', 10),
    'connect_timeout' => (int) env('ENPII_WHATSAPP_GATEWAY_CONNECT_TIMEOUT', 3),
];
