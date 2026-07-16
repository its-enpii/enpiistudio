<?php

declare(strict_types=1);

namespace EnpiiStudio\WhatsAppClient\Http;

use Closure;
use EnpiiStudio\WhatsAppClient\Contracts\WhatsAppGateway;
use EnpiiStudio\WhatsAppClient\DTOs\ConnectionResult;
use EnpiiStudio\WhatsAppClient\DTOs\InstanceStatus;
use EnpiiStudio\WhatsAppClient\DTOs\MediaMessage;
use EnpiiStudio\WhatsAppClient\DTOs\SendResult;
use EnpiiStudio\WhatsAppClient\DTOs\TextMessage;
use EnpiiStudio\WhatsAppClient\Enums\GatewayStatus;
use EnpiiStudio\WhatsAppClient\Exceptions\GatewayException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Factory;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use InvalidArgumentException;
use Throwable;

final readonly class HttpWhatsAppGateway implements WhatsAppGateway
{
    public function __construct(
        private Factory $http,
        private string $baseUrl,
        private string $apiKey,
        private int $timeout,
        private int $connectTimeout,
    ) {
        $this->validateUrl($baseUrl);

        if (trim($apiKey) === '') {
            throw new InvalidArgumentException('Gateway API key is required.');
        }
    }

    public function sendText(TextMessage $message): SendResult
    {
        $data = $this->execute(fn () => $this->request(retryTransport: true)
            ->withHeader('Idempotency-Key', $message->idempotencyKey)
            ->post('/messages/text', [
                'instance_id' => $message->instanceId,
                'to' => $message->to,
                'text' => $message->text,
            ]));

        return new SendResult($this->required($data, 'message_id'), $this->required($data, 'status'));
    }

    public function sendMedia(MediaMessage $message): SendResult
    {
        $data = $this->execute(fn () => $this->request(retryTransport: true)
            ->withHeader('Idempotency-Key', $message->idempotencyKey)
            ->post('/messages/media', [
                'instance_id' => $message->instanceId,
                'to' => $message->to,
                'media_url' => $message->mediaUrl,
                'caption' => $message->caption,
                'filename' => $message->filename,
            ]));

        return new SendResult($this->required($data, 'message_id'), $this->required($data, 'status'));
    }

    public function status(string $instanceId): InstanceStatus
    {
        $id = $this->id($instanceId);
        $data = $this->execute(fn () => $this->request()->get("/instances/{$id}/status"));

        return new InstanceStatus($this->matchingInstance($data, $instanceId), $this->statusValue($data));
    }

    public function connect(string $instanceId): ConnectionResult
    {
        $id = $this->id($instanceId);
        $data = $this->execute(fn () => $this->request()->post("/instances/{$id}/connect"));

        return new ConnectionResult(
            $this->matchingInstance($data, $instanceId),
            $this->statusValue($data),
            $this->optional($data, 'qr_code'),
            $this->optional($data, 'pairing_code'),
        );
    }

    public function disconnect(string $instanceId): InstanceStatus
    {
        $id = $this->id($instanceId);
        $data = $this->execute(fn () => $this->request()->post("/instances/{$id}/disconnect"));

        return new InstanceStatus($this->matchingInstance($data, $instanceId), $this->statusValue($data));
    }

    private function request(bool $retryTransport = false): PendingRequest
    {
        $request = $this->http
            ->baseUrl(rtrim($this->baseUrl, '/'))
            ->acceptJson()
            ->asJson()
            ->withToken($this->apiKey)
            ->connectTimeout($this->connectTimeout)
            ->timeout($this->timeout);

        return $retryTransport
            ? $request->retry(2, 100, fn ($exception) => $exception instanceof ConnectionException, throw: false)
            : $request;
    }

    private function execute(Closure $request): array
    {
        try {
            return $this->data($request());
        } catch (ConnectionException $exception) {
            throw GatewayException::transport($exception);
        } catch (GatewayException $exception) {
            throw $exception;
        } catch (Throwable $exception) {
            throw GatewayException::protocol('unreadable JSON', $exception);
        }
    }

    private function data(Response $response): array
    {
        $data = $response->json();

        if ($response->failed()) {
            throw GatewayException::response(
                $response->status(),
                is_array($data) && is_string($data['code'] ?? null) ? $data['code'] : 'HTTP_ERROR',
                is_array($data) && is_string($data['request_id'] ?? null) ? $data['request_id'] : $response->header('X-Request-ID'),
                is_array($data) && is_bool($data['retryable'] ?? null) ? $data['retryable'] : $response->status() >= 500,
            );
        }

        if (! is_array($data) || array_is_list($data)) {
            throw GatewayException::protocol('JSON object required');
        }

        return $data;
    }

    private function required(array $data, string $field): string
    {
        $value = $data[$field] ?? null;

        return is_string($value) && $value !== '' ? $value : throw GatewayException::protocol($field);
    }

    private function optional(array $data, string $field): ?string
    {
        $value = $data[$field] ?? null;

        if ($value !== null && ! is_string($value)) {
            throw GatewayException::protocol($field);
        }

        return $value;
    }

    private function statusValue(array $data): GatewayStatus
    {
        $value = $this->required($data, 'status');

        return GatewayStatus::tryFrom($value) ?? throw GatewayException::protocol('status');
    }

    private function matchingInstance(array $data, string $expected): string
    {
        $actual = $this->required($data, 'instance_id');

        return hash_equals($expected, $actual) ? $actual : throw GatewayException::protocol('instance_id mismatch');
    }

    private function id(string $instanceId): string
    {
        $instanceId = trim($instanceId);

        if ($instanceId === '' || strlen($instanceId) > 100) {
            throw new InvalidArgumentException('Instance ID must contain 1-100 characters.');
        }

        return rawurlencode($instanceId);
    }

    private function validateUrl(string $url): void
    {
        $parts = parse_url($url);
        $scheme = strtolower((string) ($parts['scheme'] ?? ''));
        $host = strtolower((string) ($parts['host'] ?? ''));
        $loopback = in_array($host, ['localhost', '127.0.0.1', '::1'], true);

        if ($parts === false || $host === '' || isset($parts['user']) || isset($parts['pass']) || ($scheme !== 'https' && ! ($scheme === 'http' && $loopback))) {
            throw new InvalidArgumentException('Gateway URL must be valid HTTPS, except exact loopback hosts may use HTTP.');
        }
    }
}
