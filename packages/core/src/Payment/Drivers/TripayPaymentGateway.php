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

final class TripayPaymentGateway implements PaymentGateway
{
    use InteractsWithPaymentApis;

    public function __construct(
        private readonly string $apiKey,
        private readonly string $privateKey,
        private readonly string $merchantCode = '',
        private readonly bool $isProduction = false,
        private readonly int $timeout = 15,
    ) {}

    public function createTransaction(PaymentTransactionDto $dto): PaymentResultDto
    {
        $payload = [
            'method' => $dto->paymentMethod,
            'merchant_ref' => $dto->orderId,
            'amount' => $dto->amount,
            'customer_name' => $dto->customerName,
            'customer_email' => $dto->customerEmail,
            'customer_phone' => $dto->customerPhone,
            'order_items' => $dto->items,
            'return_url' => $dto->returnUrl,
            'expired_time' => now()->addDay()->getTimestamp(),
            'signature' => hash_hmac('sha256', $this->merchantCode.$dto->orderId.$dto->amount, $this->privateKey),
        ];

        $response = $this->send(
            fn (): object => $this->request()->post('transaction/create', array_merge($payload, $dto->metadata)),
            'Tripay transaction creation failed.',
        );
        $body = $this->decode($response, 'Tripay transaction creation failed.');

        return new PaymentResultDto(
            reference: (string) ($body['data']['reference'] ?? ''),
            merchantOrderId: (string) ($body['data']['merchant_ref'] ?? $dto->orderId),
            paymentUrl: (string) ($body['data']['checkout_url'] ?? ''),
            qrString: (string) ($body['data']['qr_string'] ?? ''),
            qrUrl: (string) ($body['data']['qr_url'] ?? ''),
            amount: isset($body['data']['amount']) ? (int) $body['data']['amount'] : $dto->amount,
            status: PaymentStatus::fromTripay((string) ($body['data']['status'] ?? 'UNPAID')),
            rawResponse: $body,
        );
    }

    public function verifyCallback(array $payload, array $headers = []): CallbackResultDto
    {
        $this->assertRequired($payload, ['reference', 'merchant_ref', 'status']);

        $headers = array_change_key_case($headers, CASE_LOWER);
        $signature = (string) ($headers['x-callback-signature'] ?? '');
        $json = (string) ($headers['x-callback-json'] ?? json_encode($payload, JSON_THROW_ON_ERROR));
        $expected = hash_hmac('sha256', $json, $this->privateKey);

        if ($signature === '' || ! hash_equals($expected, $signature)) {
            return $this->invalidCallback($payload);
        }

        return new CallbackResultDto(
            reference: (string) $payload['reference'],
            merchantOrderId: (string) $payload['merchant_ref'],
            amount: isset($payload['amount']) ? (int) $payload['amount'] : null,
            status: PaymentStatus::fromTripay((string) $payload['status']),
            paidAt: isset($payload['paid_at']) ? $this->date((int) $payload['paid_at']) : null,
            isValid: true,
            rawPayload: $payload,
        );
    }

    public function checkStatus(string $reference): PaymentResultDto
    {
        $payload = ['reference' => $reference];
        $payload['signature'] = hash_hmac('sha256', $this->merchantCode.$reference, $this->privateKey);
        $response = $this->send(
            fn (): object => $this->request()->get('transaction/detail', $payload),
            "Tripay status check failed for [{$reference}].",
        );
        $body = $this->decode($response, "Tripay status check failed for [{$reference}].");

        return new PaymentResultDto(
            reference: (string) ($body['data']['reference'] ?? $reference),
            merchantOrderId: (string) ($body['data']['merchant_ref'] ?? ''),
            paymentUrl: (string) ($body['data']['checkout_url'] ?? ''),
            qrString: (string) ($body['data']['qr_string'] ?? ''),
            qrUrl: (string) ($body['data']['qr_url'] ?? ''),
            amount: isset($body['data']['amount']) ? (int) $body['data']['amount'] : null,
            status: PaymentStatus::fromTripay((string) ($body['data']['status'] ?? '')),
            rawResponse: $body,
        );
    }

    private function request()
    {
        $baseUrl = $this->isProduction
            ? 'https://tripay.co.id/api/v2/'
            : 'https://tripay.co.id/api-sandbox/v2/';

        return Http::baseUrl($baseUrl)
            ->acceptJson()
            ->timeout($this->timeout)
            ->withToken($this->apiKey);
    }
}
