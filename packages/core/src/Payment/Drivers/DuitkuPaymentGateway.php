<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\Payment\Drivers;

use EnpiiStudio\Core\Payment\Concerns\InteractsWithPaymentApis;
use EnpiiStudio\Core\Payment\Contracts\PaymentGateway;
use EnpiiStudio\Core\Payment\DTOs\CallbackResultDto;
use EnpiiStudio\Core\Payment\DTOs\PaymentResultDto;
use EnpiiStudio\Core\Payment\DTOs\PaymentTransactionDto;
use EnpiiStudio\Core\Payment\Enums\PaymentStatus;
use Illuminate\Support\Facades\Http;

final class DuitkuPaymentGateway implements PaymentGateway
{
    use InteractsWithPaymentApis;

    public function __construct(
        private readonly string $merchantCode,
        private readonly string $apiKey,
        private readonly bool $isProduction = false,
        private readonly int $timeout = 15,
    ) {}

    public function createTransaction(PaymentTransactionDto $dto): PaymentResultDto
    {
        $expiryPeriod = max(1, (int) ($dto->metadata['expiry_minutes'] ?? 1440));
        $callbackUrl = (string) ($dto->metadata['callback_url'] ?? '');
        $signature = md5($this->merchantCode.$dto->orderId.$dto->amount.$this->apiKey);
        $payload = [
            'merchantCode' => $this->merchantCode,
            'paymentAmount' => $dto->amount,
            'paymentMethod' => $dto->paymentMethod,
            'merchantOrderId' => $dto->orderId,
            'productItems' => $dto->items,
            'customerVaName' => $dto->customerName,
            'email' => $dto->customerEmail,
            'phoneNumber' => $dto->customerPhone,
            'callbackUrl' => $callbackUrl,
            'returnUrl' => $dto->returnUrl,
            'expiryPeriod' => $expiryPeriod,
            'signature' => $signature,
        ];

        $response = $this->send(
            fn (): object => $this->request()->post('/api/merchant/createinvoice', $payload),
            'Duitku transaction creation failed.',
        );
        $body = $this->decode($response, 'Duitku transaction creation failed.');

        return new PaymentResultDto(
            reference: (string) ($body['reference'] ?? ''),
            merchantOrderId: $dto->orderId,
            paymentUrl: (string) ($body['paymentUrl'] ?? ''),
            qrString: (string) ($body['qrString'] ?? ''),
            amount: isset($body['amount']) ? (int) $body['amount'] : $dto->amount,
            rawResponse: $body,
        );
    }

    public function verifyCallback(array $payload, array $headers = []): CallbackResultDto
    {
        $this->assertRequired($payload, ['merchantCode', 'amount', 'merchantOrderId', 'resultCode']);

        $signature = md5($payload['merchantCode'].$payload['amount'].$payload['merchantOrderId'].$this->apiKey);
        if (! hash_equals($signature, (string) ($payload['signature'] ?? ''))) {
            return $this->invalidCallback($payload);
        }

        return new CallbackResultDto(
            reference: (string) ($payload['reference'] ?? ''),
            merchantOrderId: (string) $payload['merchantOrderId'],
            amount: (int) $payload['amount'],
            status: PaymentStatus::fromDuitku((string) $payload['resultCode']),
            paidAt: isset($payload['paymentDate']) ? $this->date((string) $payload['paymentDate']) : null,
            isValid: true,
            rawPayload: $payload,
        );
    }

    public function checkStatus(string $reference): PaymentResultDto
    {
        $signature = md5($this->merchantCode.$reference.$this->apiKey);
        $response = $this->send(
            fn (): object => $this->request()->post('/api/merchant/transactionstatus', [
                'merchantCode' => $this->merchantCode,
                'merchantOrderId' => $reference,
                'signature' => $signature,
            ]),
            "Duitku status check failed for [{$reference}].",
        );
        $body = $this->decode($response, "Duitku status check failed for [{$reference}].");

        return new PaymentResultDto(
            reference: (string) ($body['reference'] ?? ''),
            merchantOrderId: (string) ($body['merchantOrderId'] ?? $reference),
            amount: isset($body['amount']) ? (int) $body['amount'] : null,
            status: PaymentStatus::fromDuitku((string) ($body['statusCode'] ?? '')),
            rawResponse: $body,
        );
    }

    private function request()
    {
        $baseUrl = $this->isProduction
            ? 'https://passport.duitku.com'
            : 'https://sandbox.duitku.com';

        return Http::baseUrl($baseUrl)->acceptJson()->timeout($this->timeout);
    }
}
