<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\Tests;

use EnpiiStudio\Core\Payment\Contracts\PaymentGateway;
use EnpiiStudio\Core\Payment\Drivers\DuitkuPaymentGateway;
use EnpiiStudio\Core\Payment\Drivers\TripayPaymentGateway;
use EnpiiStudio\Core\Payment\DTOs\CallbackResultDto;
use EnpiiStudio\Core\Payment\DTOs\PaymentTransactionDto;
use EnpiiStudio\Core\Payment\Enums\PaymentStatus;
use EnpiiStudio\Core\Payment\Events\PaymentCallbackVerified;
use EnpiiStudio\Core\Payment\Exceptions\PaymentCallbackException;
use EnpiiStudio\Core\Payment\Exceptions\PaymentConfigurationException;
use EnpiiStudio\Core\Payment\Exceptions\PaymentRequestException;
use EnpiiStudio\Core\Payment\PaymentManager;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Http;
use PHPUnit\Framework\Attributes\Test;
use RuntimeException;

final class PaymentTest extends TestCase
{
    private const TRIPAY_KEY = 'tripay-private-key';

    private const DUITKU_KEY = 'duitku-api-key';

    #[Test]
    public function tripay_creates_transaction_with_hmac_signature(): void
    {
        Http::fake([
            'tripay.co.id/api-sandbox/v2/transaction/create' => Http::response([
                'success' => true,
                'data' => [
                    'reference' => 'TR-123',
                    'merchant_ref' => 'ORDER-1',
                    'checkout_url' => 'https://example.test/checkout',
                    'amount' => 15000,
                    'status' => 'UNPAID',
                ],
            ]),
        ]);

        $result = $this->tripay()->createTransaction($this->transaction());

        Http::assertSent(fn (object $request): bool => $request->url() === 'https://tripay.co.id/api-sandbox/v2/transaction/create'
            && $request->data()['merchant_ref'] === 'ORDER-1'
            && $request->data()['signature'] === hash_hmac('sha256', 'M1ORDER-115000', self::TRIPAY_KEY));

        self::assertSame('TR-123', $result->reference);
        self::assertSame('ORDER-1', $result->merchantOrderId);
        self::assertSame(15000, $result->amount);
        self::assertSame(PaymentStatus::Pending, $result->status);
    }

    #[Test]
    public function duitku_creates_transaction_with_md5_signature(): void
    {
        Http::fake([
            'sandbox.duitku.com/api/merchant/createinvoice' => Http::response([
                'reference' => 'D2-123',
                'paymentUrl' => 'https://example.test/pay',
                'amount' => 15000,
            ]),
        ]);

        $result = $this->duitku()->createTransaction($this->transaction());

        Http::assertSent(fn (object $request): bool => $request->url() === 'https://sandbox.duitku.com/api/merchant/createinvoice'
            && $request->data()['merchantOrderId'] === 'ORDER-1'
            && $request->data()['signature'] === md5('M2ORDER-115000'.self::DUITKU_KEY));

        self::assertSame('D2-123', $result->reference);
        self::assertSame('https://example.test/pay', $result->paymentUrl);
        self::assertSame(PaymentStatus::Pending, $result->status);
    }

    #[Test]
    public function tripay_verifies_valid_and_invalid_callbacks(): void
    {
        $payload = ['reference' => 'TR-123', 'merchant_ref' => 'ORDER-1', 'amount' => 15000, 'status' => 'PAID', 'paid_at' => 1769000000];
        $gateway = $this->tripay();

        $valid = $gateway->verifyCallback($payload, [
            'X-Callback-Signature' => hash_hmac('sha256', json_encode($payload), self::TRIPAY_KEY),
        ]);
        $invalid = $gateway->verifyCallback($payload, ['X-Callback-Signature' => 'bad']);

        self::assertTrue($valid->isValid);
        self::assertSame(PaymentStatus::Paid, $valid->status);
        self::assertSame('ORDER-1', $valid->merchantOrderId);
        self::assertFalse($invalid->isValid);
    }

    #[Test]
    public function duitku_verifies_valid_and_invalid_callbacks(): void
    {
        $payload = ['reference' => 'D2-123', 'merchantCode' => 'M2', 'amount' => 15000, 'merchantOrderId' => 'ORDER-1', 'resultCode' => '1', 'paymentDate' => '2026-01-01 12:00:00'];
        $payload['signature'] = md5('M215000ORDER-1'.self::DUITKU_KEY);
        $gateway = $this->duitku();

        $valid = $gateway->verifyCallback($payload);
        $invalid = $gateway->verifyCallback([...$payload, 'signature' => 'bad']);

        self::assertTrue($valid->isValid);
        self::assertSame(PaymentStatus::Paid, $valid->status);
        self::assertNotNull($valid->paidAt);
        self::assertFalse($invalid->isValid);
    }

    #[Test]
    public function drivers_check_status_and_normalize_provider_results(): void
    {
        Http::fake([
            'tripay.co.id/api-sandbox/v2/transaction/detail*' => Http::response(['data' => ['reference' => 'TR-123', 'merchant_ref' => 'ORDER-1', 'amount' => 15000, 'status' => 'PAID']]),
            'sandbox.duitku.com/api/merchant/transactionstatus' => Http::response(['reference' => 'D2-123', 'merchantOrderId' => 'ORDER-1', 'amount' => 15000, 'statusCode' => '1']),
        ]);

        $tripay = $this->tripay()->checkStatus('TR-123');
        $duitku = $this->duitku()->checkStatus('ORDER-1');

        self::assertSame(PaymentStatus::Paid, $tripay->status);
        self::assertSame('TR-123', $tripay->reference);
        self::assertSame(PaymentStatus::Paid, $duitku->status);
        self::assertSame('ORDER-1', $duitku->merchantOrderId);
    }

    #[Test]
    public function failed_http_and_network_requests_are_wrapped(): void
    {
        Http::fake([
            'tripay.co.id/*' => Http::response(['error' => 'denied'], 403),
            'sandbox.duitku.com/*' => fn (): object => throw new RuntimeException('timeout'),
        ]);

        try {
            $this->tripay()->createTransaction($this->transaction());
        } catch (PaymentRequestException $exception) {
            self::assertSame(['error' => 'denied'], $exception->response);
        }

        self::expectException(PaymentRequestException::class);
        self::expectExceptionMessage('Duitku transaction creation failed.');
        $this->duitku()->createTransaction($this->transaction());
    }

    #[Test]
    public function manager_resolves_configured_and_runtime_drivers(): void
    {
        config()->set('enpii-core.payment.drivers.tripay', [
            'api_key' => 'configured-key',
            'private_key' => 'configured-private-key',
            'merchant_code' => 'M1',
        ]);

        $manager = app(PaymentManager::class);
        $configured = $manager->driver('tripay');
        $runtime = $manager->driver('tripay', ['api_key' => 'runtime-key', 'private_key' => 'runtime-private-key', 'merchant_code' => 'M1']);

        self::assertSame($configured, $manager->driver('tripay'));
        self::assertNotSame($configured, $runtime);
        self::assertInstanceOf(PaymentGateway::class, $configured);
    }

    #[Test]
    public function manager_requires_credentials_and_supports_extensions(): void
    {
        $manager = app(PaymentManager::class);

        self::expectException(PaymentConfigurationException::class);
        self::expectExceptionMessage('Tripay requires api_key and private_key.');

        try {
            $manager->driver('tripay');
        } catch (PaymentConfigurationException $exception) {
            $manager->extend('custom', fn (): PaymentGateway => $this->tripay());
            $manager->extend('custom', fn (): PaymentGateway => $this->tripay());
            self::assertInstanceOf(PaymentGateway::class, $manager->driver('custom'));

            throw $exception;
        }
    }

    #[Test]
    public function verified_callback_event_contains_driver_and_result(): void
    {
        Event::fake();

        $payload = ['reference' => 'TR-123', 'merchant_ref' => 'ORDER-1', 'amount' => 15000, 'status' => 'PAID'];
        $result = $this->tripay()->verifyCallback($payload, [
            'X-Callback-Signature' => hash_hmac('sha256', json_encode($payload), self::TRIPAY_KEY),
        ]);
        event(new PaymentCallbackVerified('tripay', $result));

        Event::assertDispatched(PaymentCallbackVerified::class, fn (PaymentCallbackVerified $event): bool => $event->driver === 'tripay' && $event->result->isValid);
    }

    #[Test]
    public function callback_results_reject_missing_required_fields(): void
    {
        $this->expectException(PaymentCallbackException::class);

        $this->duitku()->verifyCallback([]);
    }

    #[Test]
    public function result_dto_type_shaping_is_preserved(): void
    {
        $reflection = new \ReflectionClass(CallbackResultDto::class);

        self::assertTrue($reflection->isReadOnly());
    }

    private function tripay(): TripayPaymentGateway
    {
        return new TripayPaymentGateway('tripay-api-key', self::TRIPAY_KEY, 'M1');
    }

    private function duitku(): DuitkuPaymentGateway
    {
        return new DuitkuPaymentGateway('M2', self::DUITKU_KEY);
    }

    private function transaction(): PaymentTransactionDto
    {
        return new PaymentTransactionDto(
            orderId: 'ORDER-1',
            amount: 15000,
            customerName: 'Test User',
            customerEmail: 'test@example.com',
            customerPhone: '08123456789',
            paymentMethod: 'QRIS',
            items: [['sku' => 'SKU-1', 'name' => 'Item', 'price' => 15000, 'quantity' => 1]],
            returnUrl: 'https://example.test/return',
            metadata: ['callback_url' => 'https://example.test/callback'],
        );
    }
}
