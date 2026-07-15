<?php

declare(strict_types=1);

namespace EnpiiStudio\WhatsAppClient\Exceptions;

use RuntimeException;
use Throwable;

final class GatewayException extends RuntimeException
{
    public static function transport(Throwable $previous): self
    {
        return new self('WhatsApp Gateway transport failure.', 0, $previous);
    }

    public static function response(int $status, string $message): self
    {
        return new self("WhatsApp Gateway returned HTTP {$status}: {$message}");
    }

    public static function protocol(string $field): self
    {
        return new self("WhatsApp Gateway response is missing [{$field}].");
    }
}
