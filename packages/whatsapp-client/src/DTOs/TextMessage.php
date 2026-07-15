<?php

declare(strict_types=1);

namespace EnpiiStudio\WhatsAppClient\DTOs;

use InvalidArgumentException;

final readonly class TextMessage
{
    public function __construct(
        public string $instanceId,
        public string $to,
        public string $text,
        public string $idempotencyKey,
    ) {
        self::required($instanceId, 'Instance ID');
        self::required($idempotencyKey, 'Idempotency key');

        if (! preg_match('/^\+?[1-9]\d{7,14}$/', $to)) {
            throw new InvalidArgumentException('Recipient must be an E.164-like phone number.');
        }

        if (trim($text) === '') {
            throw new InvalidArgumentException('Message text must not be empty.');
        }
    }

    private static function required(string $value, string $name): void
    {
        if (trim($value) === '') {
            throw new InvalidArgumentException("{$name} must not be empty.");
        }
    }
}
