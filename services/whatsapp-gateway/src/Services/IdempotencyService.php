<?php

declare(strict_types=1);

namespace EnpiiStudio\WhatsAppGateway\Services;

use Closure;
use EnpiiStudio\WhatsAppGateway\Exceptions\GatewayApiException;
use Illuminate\Database\ConnectionInterface;
use Illuminate\Database\QueryException;
use Illuminate\Support\Str;
use Throwable;

final readonly class IdempotencyService
{
    public function __construct(private ConnectionInterface $database) {}

    public function run(string $principalId, string $operation, string $key, array $payload, Closure $callback): array
    {
        if (! preg_match('/^[A-Za-z0-9._:-]{8,200}$/', $key)) {
            throw new GatewayApiException('INVALID_IDEMPOTENCY_KEY', 'A valid idempotency key is required.', 422);
        }

        $keyHash = hash('sha256', $key);
        $requestHash = hash('sha256', json_encode($payload, JSON_THROW_ON_ERROR));
        $id = (string) Str::uuid();
        $existing = $this->record($principalId, $operation, $keyHash);

        if ($existing !== null) {
            return $this->replay($existing, $requestHash);
        }

        try {
            $this->database->table('gateway_idempotency_keys')->insert([
                'id' => $id,
                'principal_id' => $principalId,
                'operation' => $operation,
                'key_hash' => $keyHash,
                'request_hash' => $requestHash,
                'status' => 'processing',
                'expires_at' => now()->addDays(7),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (QueryException $exception) {
            $existing = $this->record($principalId, $operation, $keyHash);

            if ($existing === null) {
                throw $exception;
            }

            return $this->replay($existing, $requestHash);
        }

        try {
            $response = $callback($id);
        } catch (GatewayApiException $exception) {
            $this->fail($id, $exception->errorCode, $exception->getMessage(), $exception->httpStatus, $exception->retryable);

            throw $exception;
        } catch (Throwable $exception) {
            $failure = new GatewayApiException(
                'INTERNAL_ERROR',
                'The request could not be completed.',
                500,
                false,
                $exception,
            );
            $this->fail($id, $failure->errorCode, $failure->getMessage(), $failure->httpStatus, $failure->retryable);

            throw $failure;
        }

        $this->database->transaction(function () use ($id, $response): void {
            $this->database->table('gateway_idempotency_keys')->where('id', $id)->update([
                'status' => 'completed',
                'response' => json_encode($response, JSON_THROW_ON_ERROR),
                'http_status' => 202,
                'updated_at' => now(),
            ]);
        });

        return $response;
    }

    private function fail(string $id, string $code, string $message, int $httpStatus, bool $retryable): void
    {
        $this->database->table('gateway_idempotency_keys')->where('id', $id)->update([
            'status' => 'failed',
            'response' => json_encode([
                'code' => $code,
                'message' => $message,
                'retryable' => $retryable,
            ], JSON_THROW_ON_ERROR),
            'http_status' => $httpStatus,
            'updated_at' => now(),
        ]);
    }

    private function record(string $principalId, string $operation, string $keyHash): ?object
    {
        return $this->database->table('gateway_idempotency_keys')
            ->where('principal_id', $principalId)
            ->where('operation', $operation)
            ->where('key_hash', $keyHash)
            ->first();
    }

    private function replay(object $existing, string $requestHash): array
    {
        if (! hash_equals($existing->request_hash, $requestHash)) {
            throw new GatewayApiException('IDEMPOTENCY_CONFLICT', 'Idempotency key belongs to another request.', 409);
        }

        if ($existing->status === 'completed') {
            return json_decode($existing->response, true, flags: JSON_THROW_ON_ERROR);
        }

        if ($existing->status === 'failed') {
            $error = json_decode($existing->response, true, flags: JSON_THROW_ON_ERROR);

            throw new GatewayApiException(
                $error['code'],
                $error['message'],
                (int) $existing->http_status,
                $error['retryable'],
            );
        }

        throw new GatewayApiException('REQUEST_IN_PROGRESS', 'The original request is still processing.', 409, true);
    }
}
