<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\Payment\DTOs;

final readonly class PaymentTransactionDto
{
    /**
     * @param  array<int, array<string, mixed>>  $items
     * @param  array<string, mixed>  $metadata
     */
    public function __construct(
        public string $orderId,
        public int $amount,
        public string $customerName = '',
        public string $customerEmail = '',
        public string $customerPhone = '',
        public string $paymentMethod = '',
        public array $items = [],
        public string $returnUrl = '',
        public array $metadata = [],
    ) {}
}
