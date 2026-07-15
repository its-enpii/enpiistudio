<?php

declare(strict_types=1);

namespace EnpiiStudio\WhatsAppClient\DTOs;

use InvalidArgumentException;

final readonly class MediaMessage
{
    public function __construct(
        public string $instanceId,
        public string $to,
        public string $mediaUrl,
        public string $idempotencyKey,
        public ?string $caption = null,
        public ?string $filename = null,
    ) {
        if (trim($instanceId) === '' || trim($idempotencyKey) === '') {
            throw new InvalidArgumentException('Instance ID and idempotency key are required.');
        }

        if (! preg_match('/^\+?[1-9]\d{7,14}$/', $to)) {
            throw new InvalidArgumentException('Recipient must be an E.164-like phone number.');
        }

        if (filter_var($mediaUrl, FILTER_VALIDATE_URL) === false || parse_url($mediaUrl, PHP_URL_SCHEME) !== 'https') {
            throw new InvalidArgumentException('Media URL must be a valid HTTPS URL.');
        }
    }
}
