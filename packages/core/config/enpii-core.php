<?php

declare(strict_types=1);

return [
    'media' => [
        'disk' => env('ENPII_CORE_MEDIA_DISK', 'public'),
    ],
    'payment' => [
        'default' => env('ENPII_CORE_PAYMENT_DEFAULT', 'tripay'),
        'drivers' => [
            'tripay' => [
                'api_key' => env('ENPII_CORE_TRIPAY_API_KEY'),
                'private_key' => env('ENPII_CORE_TRIPAY_PRIVATE_KEY'),
                'merchant_code' => env('ENPII_CORE_TRIPAY_MERCHANT_CODE'),
                'is_production' => (bool) env('ENPII_CORE_TRIPAY_PRODUCTION', false),
                'timeout' => (int) env('ENPII_CORE_TRIPAY_TIMEOUT', 15),
            ],
            'duitku' => [
                'merchant_code' => env('ENPII_CORE_DUITKU_MERCHANT_CODE'),
                'api_key' => env('ENPII_CORE_DUITKU_API_KEY'),
                'is_production' => (bool) env('ENPII_CORE_DUITKU_PRODUCTION', false),
                'timeout' => (int) env('ENPII_CORE_DUITKU_TIMEOUT', 15),
            ],
        ],
    ],
];
