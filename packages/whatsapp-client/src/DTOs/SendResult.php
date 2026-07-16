<?php

declare(strict_types=1);

namespace EnpiiStudio\WhatsAppClient\DTOs;

use InvalidArgumentException;

final readonly class SendResult
{
    public function __construct(
        public string $messageId,
        public string $status,
    ) {
        if (trim($messageId) === '' || ! in_array($status, ['accepted', 'sent'], true)) {
            throw new InvalidArgumentException('Send result must contain a message ID and canonical status.');
        }
    }
}
