<?php

declare(strict_types=1);

namespace EnpiiStudio\WhatsAppClient\DTOs;

final readonly class InstanceStatus
{
    public function __construct(
        public string $instanceId,
        public string $status,
    ) {}
}
