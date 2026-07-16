<?php

declare(strict_types=1);

namespace EnpiiStudio\WhatsAppClient\Exceptions;

use RuntimeException;
use Throwable;

final class GatewayException extends RuntimeException
{
    public function __construct(
        string $message,
        public readonly string $kind,
        public readonly bool $retryable = false,
        public readonly ?int $httpStatus = null,
        public readonly ?string $gatewayCode = null,
        public readonly ?string $requestId = null,
        ?Throwable $previous = null,
    ) {
        parent::__construct($message, 0, $previous);
    }

    public static function transport(Throwable $previous): self
    {
        return new self('WhatsApp Gateway transport failure.', 'transport', true, previous: $previous);
    }

    public static function response(int $status, ?string $code, ?string $requestId, bool $retryable): self
    {
        return new self(
            "WhatsApp Gateway request failed ({$code}).",
            'response',
            $retryable,
            $status,
            $code,
            $requestId,
        );
    }

    public static function protocol(string $detail, ?Throwable $previous = null): self
    {
        return new self("Invalid WhatsApp Gateway response ({$detail}).", 'protocol', previous: $previous);
    }
}
