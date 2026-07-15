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
use EnpiiStudio\WhatsAppClient\Exceptions\GatewayException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Factory;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use InvalidArgumentException;

final readonly class HttpWhatsAppGateway implements WhatsAppGateway
{
    public function __construct(
        private Factory $http,
        private string $baseUrl,
        private string $apiKey,
        private int $timeout,
        private int $connectTimeout,
    ) {
        if (! str_starts_with($baseUrl, 'https://') && ! str_starts_with($baseUrl, 'http://localhost')) {
            throw new InvalidArgumentException('Gateway URL must use HTTPS except on localhost.');
        }

        if (trim($apiKey) === '') {
            throw new InvalidArgumentException('Gateway API key is required.');
        }
    }

    public function sendText(TextMessage $message): SendResult
    {
        $data = $this->execute(fn () => $this->request()
            ->withHeader('Idempotency-Key', $message->idempotencyKey)
            ->post('/messages/text', [
                'instance_id' => $message->instanceId,
                'to' => $message->to,
                'text' => $message->text,
            ]));

        return $this->sendResult($data);
    }

    public function sendMedia(MediaMessage $message): SendResult
    {
        $data = $this->execute(fn () => $this->request()
            ->withHeader('Idempotency-Key', $message->idempotencyKey)
            ->post('/messages/media', [
                'instance_id' => $message->instanceId,
                'to' => $message->to,
                'media_url' => $message->mediaUrl,
                'caption' => $message->caption,
                'filename' => $message->filename,
            ]));

        return $this->sendResult($data);
    }

    public function status(string $instanceId): InstanceStatus
    {
        return $this->instanceResult($this->execute(
            fn () => $this->request()->get('/instances/'.$this->id($instanceId).'/status'),
        ));
    }

    public function connect(string $instanceId): ConnectionResult
    {
        $data = $this->data($this->execute(
            fn () => $this->request(retryConnections: false)->post('/instances/'.$this->id($instanceId).'/connect'),
        ));

        return new ConnectionResult(
            $this->required($data, 'instance_id'),
            $this->required($data, 'status'),
            $this->optional($data, 'qr_code'),
            $this->optional($data, 'pairing_code'),
        );
    }

    public function disconnect(string $instanceId): InstanceStatus
    {
        return $this->instanceResult($this->execute(
            fn () => $this->request(retryConnections: false)->post('/instances/'.$this->id($instanceId).'/disconnect'),
        ));
    }

    private function request(bool $retryConnections = true): PendingRequest
    {
        $request = $this->http
            ->baseUrl(rtrim($this->baseUrl, '/'))
            ->acceptJson()
            ->asJson()
            ->withToken($this->apiKey)
            ->connectTimeout($this->connectTimeout)
            ->timeout($this->timeout)
            ->beforeSending(static function (): void {});

        return $retryConnections
            ? $request->retry(2, 100, fn ($exception) => $exception instanceof ConnectionException, throw: false)
            : $request;
    }

    private function execute(Closure $request): Response
    {
        try {
            return $request();
        } catch (ConnectionException $exception) {
            throw GatewayException::transport($exception);
        }
    }

    private function sendResult(Response $response): SendResult
    {
        $data = $this->data($response);

        return new SendResult($this->required($data, 'message_id'), $this->required($data, 'status'));
    }

    private function instanceResult(Response $response): InstanceStatus
    {
        $data = $this->data($response);

        return new InstanceStatus($this->required($data, 'instance_id'), $this->required($data, 'status'));
    }

    private function data(Response $response): array
    {
        if ($response->failed()) {
            throw GatewayException::response($response->status(), (string) ($response->json('message') ?? $response->body()));
        }

        return $response->json() ?? throw GatewayException::protocol('JSON body');
    }

    private function required(array $data, string $field): string
    {
        $value = $data[$field] ?? null;

        return is_string($value) && $value !== '' ? $value : throw GatewayException::protocol($field);
    }

    private function optional(array $data, string $field): ?string
    {
        $value = $data[$field] ?? null;

        if ($value === null) {
            return null;
        }

        return is_string($value) && $value !== '' ? $value : throw GatewayException::protocol($field);
    }

    private function id(string $instanceId): string
    {
        if (trim($instanceId) === '') {
            throw new InvalidArgumentException('Instance ID must not be empty.');
        }

        return rawurlencode($instanceId);
    }
}
