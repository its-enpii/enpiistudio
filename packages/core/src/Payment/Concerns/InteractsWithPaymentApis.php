<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\Payment\Concerns;

use DateTimeImmutable;
use DateTimeZone;
use EnpiiStudio\Core\Payment\DTOs\CallbackResultDto;
use EnpiiStudio\Core\Payment\Enums\PaymentStatus;
use EnpiiStudio\Core\Payment\Exceptions\PaymentCallbackException;
use EnpiiStudio\Core\Payment\Exceptions\PaymentRequestException;
use Illuminate\Http\Client\Response;

trait InteractsWithPaymentApis
{
    protected function send(callable $operation, string $message): Response
    {
        try {
            return $operation();
        } catch (\Throwable $exception) {
            throw new PaymentRequestException($message, null, $exception);
        }
    }

    /**
     * @return array<string, mixed>
     */
    protected function decode(Response $response, string $message): array
    {
        try {
            $body = $response->json();
        } catch (\Throwable $exception) {
            throw new PaymentRequestException($message, $response->json(), $exception);
        }

        if ($response->failed() || ! is_array($body)) {
            throw new PaymentRequestException($message, is_array($body) ? $body : null);
        }

        return $body;
    }

    /**
     * @param  array<string, mixed>  $payload
     * @param  list<string>  $keys
     */
    protected function assertRequired(array $payload, array $keys): void
    {
        $missing = array_filter($keys, fn (string $key): bool => ! array_key_exists($key, $payload) || $payload[$key] === null);

        if ($missing !== []) {
            throw new PaymentCallbackException('Missing required callback fields: '.implode(', ', $missing).'.');
        }
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    protected function invalidCallback(array $payload): CallbackResultDto
    {
        return new CallbackResultDto(
            reference: (string) ($payload['reference'] ?? ''),
            merchantOrderId: (string) ($payload['merchant_ref'] ?? $payload['merchantOrderId'] ?? ''),
            amount: isset($payload['amount']) ? (int) $payload['amount'] : null,
            status: PaymentStatus::Pending,
            isValid: false,
            rawPayload: $payload,
        );
    }

    protected function date(int|string $value): DateTimeImmutable
    {
        if (is_numeric($value)) {
            return new DateTimeImmutable('@'.(int) $value);
        }

        return new DateTimeImmutable($value, new DateTimeZone('UTC'));
    }
}
