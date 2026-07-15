<?php

declare(strict_types=1);

namespace EnpiiStudio\WhatsAppGateway\Controllers;

use EnpiiStudio\WhatsAppGateway\Exceptions\GatewayApiException;
use Illuminate\Database\ConnectionInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

final readonly class HealthController
{
    public function health(): JsonResponse
    {
        return response()->json(['status' => 'ok']);
    }

    public function ready(ConnectionInterface $database): JsonResponse
    {
        try {
            $database->select('select 1');
            Cache::put('gateway-readiness', true, 5);

            if (! Cache::pull('gateway-readiness')) {
                throw new \RuntimeException('Cache readiness failed.');
            }
        } catch (\Throwable) {
            throw new GatewayApiException('NOT_READY', 'Gateway dependencies are unavailable.', 503, true);
        }

        return response()->json(['status' => 'ok']);
    }
}
