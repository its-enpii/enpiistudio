<?php

declare(strict_types=1);

namespace EnpiiStudio\WhatsAppClient\DTOs;

final readonly class ConnectionResult
{
    public function __construct(
        public string $instanceId,
        public string $status,
        public ?string $qrCode = null,
        public ?string $pairingCode = null,
    ) {}
}
