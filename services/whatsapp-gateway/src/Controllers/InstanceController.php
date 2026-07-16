<?php

declare(strict_types=1);

namespace EnpiiStudio\WhatsAppGateway\Controllers;

use EnpiiStudio\WhatsAppGateway\Contracts\EvolutionProvider;
use EnpiiStudio\WhatsAppGateway\Exceptions\GatewayApiException;
use EnpiiStudio\WhatsAppGateway\Models\ApiPrincipal;
use EnpiiStudio\WhatsAppGateway\Services\InstanceAccess;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

final readonly class InstanceController
{
    public function __construct(
        private EvolutionProvider $provider,
        private InstanceAccess $access,
    ) {}

    public function status(Request $request, string $instanceId): JsonResponse
    {
        $instance = $this->access->resolve($this->principal($request), $instanceId);
        $status = $this->provider->status($instance->name);
        $instance->update(['status' => $status->value]);

        return response()->json(['instance_id' => $instance->name, 'status' => $status->value]);
    }

    public function connect(Request $request, string $instanceId): JsonResponse
    {
        $instance = $this->access->resolve($this->principal($request), $instanceId);

        $response = Cache::lock('gateway:instance:'.$instance->getKey(), 15)->get(function () use ($instance): JsonResponse {
            $result = $this->provider->connect($instance->name);
            $instance->update(['status' => $result['status']->value]);

            return response()->json([
                'instance_id' => $instance->name,
                'status' => $result['status']->value,
                'qr_code' => $result['qr_code'],
                'pairing_code' => $result['pairing_code'],
            ]);
        });

        return $response instanceof JsonResponse
            ? $response
            : throw new GatewayApiException('INSTANCE_BUSY', 'Another lifecycle operation is in progress.', 409, true);
    }

    public function disconnect(Request $request, string $instanceId): JsonResponse
    {
        $instance = $this->access->resolve($this->principal($request), $instanceId);

        $response = Cache::lock('gateway:instance:'.$instance->getKey(), 15)->get(function () use ($instance): JsonResponse {
            $status = $this->provider->disconnect($instance->name);
            $instance->update(['status' => $status->value]);

            return response()->json(['instance_id' => $instance->name, 'status' => $status->value]);
        });

        return $response instanceof JsonResponse
            ? $response
            : throw new GatewayApiException('INSTANCE_BUSY', 'Another lifecycle operation is in progress.', 409, true);
    }

    private function principal(Request $request): ApiPrincipal
    {
        $principal = $request->attributes->get('principal');

        return $principal instanceof ApiPrincipal
            ? $principal
            : throw new GatewayApiException('UNAUTHENTICATED', 'Authentication is required.', 401);
    }
}
