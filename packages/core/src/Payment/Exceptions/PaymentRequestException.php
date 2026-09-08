<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\Payment\Exceptions;

use Throwable;

final class PaymentRequestException extends PaymentException
{
    public function __construct(
        string $message,
        public readonly ?array $response = null,
        ?Throwable $previous = null,
    ) {
        parent::__construct($message, 0, $previous);
    }
}
