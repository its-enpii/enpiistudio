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

        if (strlen($instanceId) > 100) {
            throw new InvalidArgumentException('Instance ID must contain 1-100 characters.');
        }

        if (strlen($idempotencyKey) < 8 || strlen($idempotencyKey) > 200 || ! preg_match('/^[A-Za-z0-9._:-]+$/', $idempotencyKey)) {
            throw new InvalidArgumentException('Idempotency key must contain 8-200 safe characters.');
        }

        if (! preg_match('/^\+?[1-9]\d{7,14}$/', $to)) {
            throw new InvalidArgumentException('Recipient must be an E.164-like phone number.');
        }

        if (trim($text) === '' || strlen($text) > 4096) {
            throw new InvalidArgumentException('Message text must contain 1-4096 characters.');
        }
    }

    private static function required(string $value, string $name): void
    {
        if (trim($value) === '') {
            throw new InvalidArgumentException("{$name} must not be empty.");
        }
    }
}
