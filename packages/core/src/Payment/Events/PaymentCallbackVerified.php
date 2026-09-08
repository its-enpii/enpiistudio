<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\Payment\Events;

use EnpiiStudio\Core\Payment\DTOs\CallbackResultDto;

final readonly class PaymentCallbackVerified
{
    public function __construct(
        public string $driver,
        public CallbackResultDto $result,
    ) {}
}
