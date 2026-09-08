<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\Payment\Contracts;

use EnpiiStudio\Core\Payment\DTOs\CallbackResultDto;
use EnpiiStudio\Core\Payment\DTOs\PaymentResultDto;
use EnpiiStudio\Core\Payment\DTOs\PaymentTransactionDto;

interface PaymentGateway
{
    public function createTransaction(PaymentTransactionDto $dto): PaymentResultDto;

    public function verifyCallback(array $payload, array $headers = []): CallbackResultDto;

    public function checkStatus(string $reference): PaymentResultDto;
}
