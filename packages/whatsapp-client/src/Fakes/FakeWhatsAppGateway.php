<?php

declare(strict_types=1);

namespace EnpiiStudio\WhatsAppClient\Fakes;

use Closure;
use EnpiiStudio\WhatsAppClient\Contracts\WhatsAppGateway;
use EnpiiStudio\WhatsAppClient\DTOs\ConnectionResult;
use EnpiiStudio\WhatsAppClient\DTOs\InstanceStatus;
use EnpiiStudio\WhatsAppClient\DTOs\MediaMessage;
use EnpiiStudio\WhatsAppClient\DTOs\SendResult;
use EnpiiStudio\WhatsAppClient\DTOs\TextMessage;
use EnpiiStudio\WhatsAppClient\Enums\GatewayStatus;
use RuntimeException;

final class FakeWhatsAppGateway implements WhatsAppGateway
{
    public array $textMessages = [];

    public array $mediaMessages = [];

    public array $connectedInstances = [];

    public array $disconnectedInstances = [];

    public GatewayStatus $instanceStatus = GatewayStatus::Disconnected;

    public ?string $qrCode = 'fake-qr';

    public ?string $pairingCode = null;

    private array $idempotency = [];

    public function sendText(TextMessage $message): SendResult
    {
        return $this->send($message->idempotencyKey, [
            'instance' => $message->instanceId,
            'to' => $message->to,
            'text' => $message->text,
        ], function () use ($message): SendResult {
            $this->textMessages[] = $message;

            return new SendResult('fake-'.count($this->textMessages), 'accepted');
        });
    }

    public function sendMedia(MediaMessage $message): SendResult
    {
        return $this->send($message->idempotencyKey, [
            'instance' => $message->instanceId,
            'to' => $message->to,
            'media' => $message->mediaUrl,
            'caption' => $message->caption,
            'filename' => $message->filename,
        ], function () use ($message): SendResult {
            $this->mediaMessages[] = $message;

            return new SendResult('fake-media-'.count($this->mediaMessages), 'accepted');
        });
    }

    public function status(string $instanceId): InstanceStatus
    {
        return new InstanceStatus($instanceId, $this->instanceStatus);
    }

    public function connect(string $instanceId): ConnectionResult
    {
        $this->connectedInstances[] = $instanceId;
        $this->instanceStatus = GatewayStatus::Connecting;

        return new ConnectionResult($instanceId, $this->instanceStatus, $this->qrCode, $this->pairingCode);
    }

    public function disconnect(string $instanceId): InstanceStatus
    {
        $this->disconnectedInstances[] = $instanceId;
        $this->instanceStatus = GatewayStatus::Disconnected;

        return new InstanceStatus($instanceId, $this->instanceStatus);
    }

    public function assertConnected(string $instanceId): void
    {
        if (! in_array($instanceId, $this->connectedInstances, true)) {
            throw new RuntimeException("Instance [{$instanceId}] was not connected.");
        }
    }

    public function assertDisconnected(string $instanceId): void
    {
        if (! in_array($instanceId, $this->disconnectedInstances, true)) {
            throw new RuntimeException("Instance [{$instanceId}] was not disconnected.");
        }
    }

    public function assertTextSent(Closure $predicate): void
    {
        if (array_filter($this->textMessages, $predicate) === []) {
            throw new RuntimeException('No matching WhatsApp text message was sent.');
        }
    }

    public function assertMediaSent(Closure $predicate): void
    {
        if (array_filter($this->mediaMessages, $predicate) === []) {
            throw new RuntimeException('No matching WhatsApp media message was sent.');
        }
    }

    public function assertNothingSent(): void
    {
        if ($this->textMessages !== [] || $this->mediaMessages !== []) {
            throw new RuntimeException('Unexpected WhatsApp messages were sent.');
        }
    }

    private function send(string $key, array $payload, Closure $sender): SendResult
    {
        $hash = hash('sha256', json_encode($payload, JSON_THROW_ON_ERROR));

        if (isset($this->idempotency[$key])) {
            if (! hash_equals($this->idempotency[$key]['hash'], $hash)) {
                throw new RuntimeException('Idempotency key was reused with a different payload.');
            }

            return $this->idempotency[$key]['result'];
        }

        $result = $sender();
        $this->idempotency[$key] = compact('hash', 'result');

        return $result;
    }
}
