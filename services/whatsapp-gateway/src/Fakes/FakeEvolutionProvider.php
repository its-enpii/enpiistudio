<?php

declare(strict_types=1);

namespace EnpiiStudio\WhatsAppGateway\Fakes;

use EnpiiStudio\WhatsAppGateway\Contracts\EvolutionProvider;
use EnpiiStudio\WhatsAppGateway\Enums\GatewayStatus;

final class FakeEvolutionProvider implements EvolutionProvider
{
    public GatewayStatus $state = GatewayStatus::Disconnected;

    public int $sendCount = 0;

    public function status(string $instance): GatewayStatus
    {
        return $this->state;
    }

    public function connect(string $instance): array
    {
        $this->state = GatewayStatus::Connecting;

        return ['status' => $this->state, 'qr_code' => 'fake-qr', 'pairing_code' => null];
    }

    public function disconnect(string $instance): GatewayStatus
    {
        return $this->state = GatewayStatus::Disconnected;
    }

    public function sendText(string $instance, string $to, string $text): array
    {
        $this->sendCount++;

        return ['message_id' => 'fake-'.$this->sendCount, 'status' => 'accepted'];
    }
}
