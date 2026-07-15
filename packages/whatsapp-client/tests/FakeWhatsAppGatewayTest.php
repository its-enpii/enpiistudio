<?php

declare(strict_types=1);

namespace EnpiiStudio\WhatsAppClient\Tests;

use EnpiiStudio\WhatsAppClient\DTOs\TextMessage;
use EnpiiStudio\WhatsAppClient\Fakes\FakeWhatsAppGateway;
use InvalidArgumentException;
use PHPUnit\Framework\TestCase as PHPUnitTestCase;

final class FakeWhatsAppGatewayTest extends PHPUnitTestCase
{
    public function test_fake_records_messages_and_returns_contract_result(): void
    {
        $fake = new FakeWhatsAppGateway;
        $message = new TextMessage('instance-a', '+628123456789', 'Hello', 'test:1');

        $result = $fake->sendText($message);

        self::assertSame([$message], $fake->textMessages);
        self::assertSame('fake-1', $result->messageId);
        self::assertSame('accepted', $result->status);
    }

    public function test_fake_supports_explicit_connection_lifecycle(): void
    {
        $fake = new FakeWhatsAppGateway;

        self::assertSame('close', $fake->status('instance-a')->status);
        $connection = $fake->connect('instance-a');
        self::assertSame('connecting', $connection->status);
        self::assertSame('fake-qr', $connection->qrCode);
        $fake->assertConnected('instance-a');

        $fake->instanceStatus = 'open';
        self::assertSame('open', $fake->status('instance-a')->status);
        self::assertSame('close', $fake->disconnect('instance-a')->status);
        $fake->assertDisconnected('instance-a');
    }

    public function test_send_does_not_connect_implicitly(): void
    {
        $fake = new FakeWhatsAppGateway;

        $fake->sendText(new TextMessage('instance-a', '+628123456789', 'Hello', 'test:1'));

        self::assertSame([], $fake->connectedInstances);
    }

    public function test_message_requires_idempotency_key(): void
    {
        $this->expectException(InvalidArgumentException::class);

        new TextMessage('instance-a', '+628123456789', 'Hello', '');
    }
}
