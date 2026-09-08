<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\Payment\DTOs;

use EnpiiStudio\Core\Payment\Enums\PaymentStatus;

final readonly class CallbackResultDto
{
    /**
     * @param  array<string, mixed>  $rawPayload
     */
    public function __construct(
        public string $reference,
        public string $merchantOrderId,
        public ?int $amount = null,
        public PaymentStatus $status = PaymentStatus::Pending,
        public ?\DateTimeImmutable $paidAt = null,
        public bool $isValid = false,
        public array $rawPayload = [],
    ) {}
}
