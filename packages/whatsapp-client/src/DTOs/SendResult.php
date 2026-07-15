<?php

declare(strict_types=1);

namespace EnpiiStudio\WhatsAppClient\DTOs;

final readonly class SendResult
{
    public function __construct(
        public string $messageId,
        public string $status,
    ) {}
}
