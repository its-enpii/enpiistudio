<?php

declare(strict_types=1);

namespace EnpiiStudio\WhatsAppClient\Tests;

use EnpiiStudio\WhatsAppClient\Contracts\WhatsAppGateway;
use EnpiiStudio\WhatsAppClient\DTOs\TextMessage;
use EnpiiStudio\WhatsAppClient\Exceptions\GatewayException;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;

final class HttpWhatsAppGatewayTest extends TestCase
{
    public function test_sends_contract_request_with_auth_and_idempotency(): void
    {
        Http::preventStrayRequests();
        Http::fake([
            'https://gateway.test/api/v1/messages/text' => Http::response([
                'message_id' => 'message-1',
                'status' => 'accepted',
            ], 202),
        ]);

        $result = app(WhatsAppGateway::class)->sendText(new TextMessage(
            instanceId: 'instance-a',
            to: '+628123456789',
            text: 'Test',
            idempotencyKey: 'order:tenant:1',
        ));

        self::assertSame('message-1', $result->messageId);
        self::assertSame('accepted', $result->status);
        Http::assertSent(fn (Request $request) => $request->url() === 'https://gateway.test/api/v1/messages/text'
            && $request->hasHeader('Authorization', 'Bearer test-key')
            && $request->hasHeader('Idempotency-Key', 'order:tenant:1')
            && $request['instance_id'] === 'instance-a');
    }

    public function test_non_success_response_throws_consistent_exception(): void
    {
        Http::preventStrayRequests();
        Http::fake(['*' => Http::response(['message' => 'instance forbidden'], 403)]);

        $this->expectException(GatewayException::class);
        $this->expectExceptionMessage('HTTP 403');

        app(WhatsAppGateway::class)->status('another-tenant');
    }

    public function test_malformed_json_is_rejected(): void
    {
        Http::preventStrayRequests();
        Http::fake([
            'https://gateway.test/api/v1/instances/instance-a/status' => Http::response('not-json', 200, ['Content-Type' => 'application/json']),
        ]);

        $this->expectException(GatewayException::class);
        $this->expectExceptionMessage('JSON body');

        app(WhatsAppGateway::class)->status('instance-a');
    }

    public function test_server_error_is_not_retried(): void
    {
        Http::preventStrayRequests();
        Http::fake(['*' => Http::response(['message' => 'down'], 503)]);

        try {
            app(WhatsAppGateway::class)->status('instance-a');
        } catch (GatewayException) {
        }

        Http::assertSentCount(1);
    }

    public function test_connect_returns_qr_and_pairing_payload(): void
    {
        Http::preventStrayRequests();
        Http::fake([
            'https://gateway.test/api/v1/instances/instance-a/connect' => Http::response([
                'instance_id' => 'instance-a',
                'status' => 'connecting',
                'qr_code' => 'qr-payload',
                'pairing_code' => '123-456',
            ]),
        ]);

        $result = app(WhatsAppGateway::class)->connect('instance-a');

        self::assertSame('connecting', $result->status);
        self::assertSame('qr-payload', $result->qrCode);
        self::assertSame('123-456', $result->pairingCode);
    }

    public function test_connect_command_runs_bounded_status_connect_status_flow_without_send(): void
    {
        Http::preventStrayRequests();
        Http::fakeSequence()
            ->push(['instance_id' => 'instance-a', 'status' => 'close'])
            ->push(['instance_id' => 'instance-a', 'status' => 'connecting', 'qr_code' => 'sensitive-qr'])
            ->push(['instance_id' => 'instance-a', 'status' => 'connecting']);

        $this->artisan('enpii:whatsapp-connect', ['instance' => 'instance-a'])
            ->expectsOutput('Current instance status: close')
            ->expectsOutput('Connect requested. Instance status: connecting')
            ->expectsOutput('QR payload available; rerun with --show-qr in a secure terminal.')
            ->expectsOutput('Status after request: connecting')
            ->assertSuccessful();

        Http::assertSentCount(3);
        self::assertFalse(collect(Http::recorded())->contains(
            fn (array $entry) => str_contains($entry[0]->url(), '/messages/'),
        ));
    }

    public function test_smoke_command_checks_status_without_sending(): void
    {
        Http::preventStrayRequests();
        Http::fake([
            'https://gateway.test/api/v1/instances/instance-a/status' => Http::response([
                'instance_id' => 'instance-a',
                'status' => 'connected',
            ]),
        ]);

        $this->artisan('enpii:whatsapp-smoke', ['instance' => 'instance-a'])
            ->expectsOutput('Gateway reachable. Instance [instance-a] status: connected')
            ->assertSuccessful();

        Http::assertSentCount(1);
    }
}
