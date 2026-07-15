<?php

declare(strict_types=1);

namespace EnpiiStudio\WhatsAppClient\Tests;

use EnpiiStudio\WhatsAppClient\DTOs\MediaMessage;
use EnpiiStudio\WhatsAppClient\DTOs\TextMessage;
use EnpiiStudio\WhatsAppClient\Enums\GatewayStatus;
use EnpiiStudio\WhatsAppClient\Fakes\FakeWhatsAppGateway;
use InvalidArgumentException;
use PHPUnit\Framework\TestCase as PHPUnitTestCase;
use RuntimeException;

final class FakeWhatsAppGatewayTest extends PHPUnitTestCase
{
    public function test_message_dtos_reject_contract_size_violations(): void
    {
        foreach ([
            fn () => new TextMessage(str_repeat('a', 101), '+628123456789', 'Test', 'message:key:1'),
            fn () => new TextMessage('instance-a', '+628123456789', str_repeat('a', 4097), 'message:key:1'),
            fn () => new MediaMessage(str_repeat('a', 101), '+628123456789', 'https://media.test/a.jpg', 'message:key:1'),
        ] as $invalid) {
            try {
                $invalid();
                self::fail('Contract size violation was accepted.');
            } catch (InvalidArgumentException) {
                self::addToAssertionCount(1);
            }
        }
    }

    public function test_fake_records_messages_and_returns_contract_result(): void
    {
        $fake = new FakeWhatsAppGateway;
        $message = new TextMessage('instance-a', '+628123456789', 'Hello', 'test:key:1');

        $result = $fake->sendText($message);

        self::assertSame([$message], $fake->textMessages);
        self::assertSame('fake-1', $result->messageId);
        self::assertSame('accepted', $result->status);
    }

    public function test_fake_supports_explicit_connection_lifecycle(): void
    {
        $fake = new FakeWhatsAppGateway;

        self::assertSame(GatewayStatus::Disconnected, $fake->status('instance-a')->status);
        $connection = $fake->connect('instance-a');
        self::assertSame(GatewayStatus::Connecting, $connection->status);
        self::assertSame('fake-qr', $connection->qrCode);
        $fake->assertConnected('instance-a');

        $fake->instanceStatus = GatewayStatus::Connected;
        self::assertTrue($fake->status('instance-a')->isConnected());
        self::assertSame(GatewayStatus::Disconnected, $fake->disconnect('instance-a')->status);
        $fake->assertDisconnected('instance-a');
    }

    public function test_send_does_not_connect_implicitly(): void
    {
        $fake = new FakeWhatsAppGateway;

        $fake->sendText(new TextMessage('instance-a', '+628123456789', 'Hello', 'test:key:1'));

        self::assertSame([], $fake->connectedInstances);
    }

    public function test_idempotent_replay_returns_original_result_without_resending(): void
    {
        $fake = new FakeWhatsAppGateway;
        $message = new TextMessage('instance-a', '+628123456789', 'Hello', 'test:key:1');

        $first = $fake->sendText($message);
        $replay = $fake->sendText($message);

        self::assertSame($first, $replay);
        self::assertCount(1, $fake->textMessages);
    }

    public function test_idempotency_key_rejects_different_payload(): void
    {
        $fake = new FakeWhatsAppGateway;
        $fake->sendText(new TextMessage('instance-a', '+628123456789', 'Hello', 'test:key:1'));

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('different payload');

        $fake->sendText(new TextMessage('instance-a', '+628123456789', 'Changed', 'test:key:1'));
    }

    public function test_message_requires_idempotency_key(): void
    {
        $this->expectException(InvalidArgumentException::class);

        new TextMessage('instance-a', '+628123456789', 'Hello', '');
    }
}
