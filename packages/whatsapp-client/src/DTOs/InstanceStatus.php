<?php

declare(strict_types=1);

namespace EnpiiStudio\WhatsAppClient\DTOs;

use EnpiiStudio\WhatsAppClient\Enums\GatewayStatus;

final readonly class InstanceStatus
{
    public function __construct(
        public string $instanceId,
        public GatewayStatus $status,
    ) {}

    public function isConnected(): bool
    {
        return $this->status->isConnected();
    }
}
