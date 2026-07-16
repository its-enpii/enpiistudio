<?php

declare(strict_types=1);

namespace EnpiiStudio\WhatsAppGateway\Http;

use Closure;
use EnpiiStudio\WhatsAppGateway\Contracts\EvolutionProvider;
use EnpiiStudio\WhatsAppGateway\Enums\GatewayStatus;
use EnpiiStudio\WhatsAppGateway\Exceptions\GatewayApiException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Factory;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use InvalidArgumentException;
use Throwable;

final readonly class EvolutionHttpProvider implements EvolutionProvider
{
    public function __construct(
        private Factory $http,
        private string $url,
        private string $apiKey,
        private int $timeout = 10,
    ) {
        $this->validateUrl($url);

        if (trim($apiKey) === '') {
            throw new InvalidArgumentException('Evolution API key is required.');
        }
    }

    public function status(string $instance): GatewayStatus
    {
        $data = $this->execute(fn () => $this->request()->get('/instance/connectionState/'.rawurlencode($this->instance($instance))));

        return GatewayStatus::fromEvolution((string) ($data['instance']['state'] ?? 'error'));
    }

    public function connect(string $instance): array
    {
        $data = $this->execute(fn () => $this->request()->get('/instance/connect/'.rawurlencode($this->instance($instance))));

        return [
            'status' => GatewayStatus::Connecting,
            'qr_code' => is_string($data['base64'] ?? null) ? $data['base64'] : null,
            'pairing_code' => is_string($data['pairingCode'] ?? null) ? $data['pairingCode'] : null,
        ];
    }

    public function disconnect(string $instance): GatewayStatus
    {
        $this->execute(fn () => $this->request()->delete('/instance/logout/'.rawurlencode($this->instance($instance))));

        return GatewayStatus::Disconnected;
    }

    public function sendText(string $instance, string $to, string $text): array
    {
        $data = $this->execute(fn () => $this->request()->post('/message/sendText/'.rawurlencode($this->instance($instance)), [
            'number' => ltrim($to, '+'),
            'text' => $text,
        ]));
        $id = $data['key']['id'] ?? null;

        if (! is_string($id) || $id === '') {
            throw new GatewayApiException('PROVIDER_PROTOCOL_ERROR', 'Provider returned an invalid response.', 502, true);
        }

        return ['message_id' => $id, 'status' => 'accepted'];
    }

    private function request(): PendingRequest
    {
        return $this->http->baseUrl(rtrim($this->url, '/'))
            ->acceptJson()
            ->asJson()
            ->withHeader('apikey', $this->apiKey)
            ->connectTimeout(3)
            ->timeout($this->timeout);
    }

    private function execute(Closure $request): array
    {
        try {
            return $this->data($request());
        } catch (ConnectionException $exception) {
            throw new GatewayApiException('PROVIDER_UNAVAILABLE', 'WhatsApp provider is unavailable.', 503, true, $exception);
        } catch (GatewayApiException $exception) {
            throw $exception;
        } catch (Throwable $exception) {
            throw new GatewayApiException('PROVIDER_PROTOCOL_ERROR', 'Provider returned an invalid response.', 502, true, $exception);
        }
    }

    private function data(Response $response): array
    {
        if ($response->failed()) {
            throw new GatewayApiException('PROVIDER_UNAVAILABLE', 'WhatsApp provider is unavailable.', 503, true);
        }

        $data = $response->json();

        if (! is_array($data) || array_is_list($data)) {
            throw new GatewayApiException('PROVIDER_PROTOCOL_ERROR', 'Provider returned an invalid response.', 502, true);
        }

        return $data;
    }

    private function instance(string $instance): string
    {
        $instance = trim($instance);

        if ($instance === '' || strlen($instance) > 100) {
            throw new GatewayApiException('INVALID_INSTANCE', 'Instance identifier is invalid.', 422);
        }

        return $instance;
    }

    private function validateUrl(string $url): void
    {
        $parts = parse_url($url);
        $scheme = strtolower((string) ($parts['scheme'] ?? ''));
        $host = strtolower((string) ($parts['host'] ?? ''));
        $loopback = in_array($host, ['localhost', '127.0.0.1', '::1'], true);

        if ($parts === false || $host === '' || isset($parts['user']) || isset($parts['pass']) || ($scheme !== 'https' && ! ($scheme === 'http' && $loopback))) {
            throw new InvalidArgumentException('Evolution URL must be valid HTTPS, except exact loopback hosts may use HTTP.');
        }
    }
}
