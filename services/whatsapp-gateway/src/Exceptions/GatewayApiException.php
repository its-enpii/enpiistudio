<?php

declare(strict_types=1);

namespace EnpiiStudio\WhatsAppGateway\Exceptions;

use RuntimeException;
use Throwable;

final class GatewayApiException extends RuntimeException
{
    public function __construct(
        public readonly string $errorCode,
        string $safeMessage,
        public readonly int $httpStatus,
        public readonly bool $retryable = false,
        ?Throwable $previous = null,
    ) {
        parent::__construct($safeMessage, 0, $previous);
    }
}
