<?php

declare(strict_types=1);

namespace EnpiiStudio\WhatsAppClient\DTOs;

use EnpiiStudio\WhatsAppClient\Enums\GatewayStatus;

final readonly class ConnectionResult
{
    public function __construct(
        public string $instanceId,
        public GatewayStatus $status,
        public ?string $qrCode = null,
        public ?string $pairingCode = null,
    ) {}

    public function isConnected(): bool
    {
        return $this->status->isConnected();
    }
}
