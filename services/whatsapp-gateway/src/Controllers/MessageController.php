<?php

declare(strict_types=1);

namespace EnpiiStudio\WhatsAppGateway\Controllers;

use EnpiiStudio\WhatsAppGateway\Contracts\EvolutionProvider;
use EnpiiStudio\WhatsAppGateway\Exceptions\GatewayApiException;
use EnpiiStudio\WhatsAppGateway\Models\ApiPrincipal;
use EnpiiStudio\WhatsAppGateway\Services\IdempotencyService;
use EnpiiStudio\WhatsAppGateway\Services\InstanceAccess;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

final readonly class MessageController
{
    public function __construct(
        private EvolutionProvider $provider,
        private InstanceAccess $access,
        private IdempotencyService $idempotency,
    ) {}

    public function text(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'instance_id' => ['required', 'string', 'max:100'],
            'to' => ['required', 'string', 'regex:/^\\+?[1-9]\\d{7,14}$/'],
            'text' => ['required', 'string', 'max:4096'],
        ]);
        $principal = $this->principal($request);
        $instance = $this->access->resolve($principal, $payload['instance_id']);
        $key = (string) $request->header('Idempotency-Key', '');

        $result = $this->idempotency->run(
            (string) $principal->getKey(),
            'messages.text',
            $key,
            $payload,
            function (string $idempotencyId) use ($instance, $payload): array {
                $result = $this->provider->sendText($instance->name, $payload['to'], $payload['text']);

                try {
                    DB::table('gateway_message_deliveries')->insert([
                        'id' => (string) Str::uuid(),
                        'instance_id' => $instance->getKey(),
                        'idempotency_id' => $idempotencyId,
                        'provider_message_id' => $result['message_id'],
                        'recipient_hash' => hash_hmac('sha256', $payload['to'], (string) config('app.key')),
                        'recipient_masked' => $this->mask($payload['to']),
                        'status' => $result['status'],
                        'attempts' => 1,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                } catch (\Throwable $exception) {
                    throw new GatewayApiException(
                        'DELIVERY_PERSISTENCE_FAILED',
                        'Message was sent but delivery persistence failed. Do not retry with a new key.',
                        500,
                        false,
                        $exception,
                    );
                }

                return $result;
            },
        );

        return response()->json($result, 202);
    }

    public function media(): JsonResponse
    {
        throw new GatewayApiException('FEATURE_UNAVAILABLE', 'Media sending is not available.', 501);
    }

    private function principal(Request $request): ApiPrincipal
    {
        $principal = $request->attributes->get('principal');

        return $principal instanceof ApiPrincipal
            ? $principal
            : throw new GatewayApiException('UNAUTHENTICATED', 'Authentication is required.', 401);
    }

    private function mask(string $recipient): string
    {
        return str_repeat('*', max(0, strlen($recipient) - 4)).substr($recipient, -4);
    }
}
