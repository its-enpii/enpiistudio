<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\Payment\DTOs;

use EnpiiStudio\Core\Payment\Enums\PaymentStatus;

final readonly class PaymentResultDto
{
    /**
     * @param  array<string, mixed>  $rawResponse
     */
    public function __construct(
        public string $reference,
        public string $merchantOrderId,
        public string $paymentUrl = '',
        public string $qrString = '',
        public string $qrUrl = '',
        public ?int $amount = null,
        public PaymentStatus $status = PaymentStatus::Pending,
        public array $rawResponse = [],
    ) {}
}
