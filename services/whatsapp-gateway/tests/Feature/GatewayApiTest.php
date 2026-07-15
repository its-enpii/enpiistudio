<?php

declare(strict_types=1);

namespace EnpiiStudio\WhatsAppGateway\Tests\Feature;

use EnpiiStudio\WhatsAppGateway\Models\ApiPrincipal;
use EnpiiStudio\WhatsAppGateway\Models\GatewayInstance;
use EnpiiStudio\WhatsAppGateway\Services\IdempotencyService;
use EnpiiStudio\WhatsAppGateway\Tests\TestCase;

final class GatewayApiTest extends TestCase
{
    public function test_health_is_public_and_returns_request_id(): void
    {
        $this->getJson('/api/v1/health')
            ->assertOk()
            ->assertJson(['status' => 'ok'])
            ->assertHeader('X-Request-ID');
    }

    public function test_protected_route_requires_valid_api_key(): void
    {
        $this->getJson('/api/v1/instances/demo/status')
            ->assertUnauthorized()
            ->assertJsonPath('code', 'UNAUTHENTICATED')
            ->assertJsonStructure(['code', 'message', 'request_id', 'retryable']);
    }

    public function test_instance_acl_fails_closed(): void
    {
        [$headers] = $this->principalWithInstance('owned');
        $other = ApiPrincipal::query()->create([
            'name' => 'other',
            'key_id' => 'other-key',
            'key_hash' => password_hash('other-secret', PASSWORD_DEFAULT),
            'status' => 'active',
        ]);
        GatewayInstance::query()->create([
            'principal_id' => $other->getKey(),
            'name' => 'foreign',
            'status' => 'disconnected',
        ]);

        $this->withHeaders($headers)->getJson('/api/v1/instances/foreign/status')
            ->assertForbidden()
            ->assertJsonPath('code', 'INSTANCE_FORBIDDEN');
    }

    public function test_lifecycle_and_text_send_use_canonical_contract(): void
    {
        [$headers] = $this->principalWithInstance('demo');

        $this->withHeaders($headers)->getJson('/api/v1/instances/demo/status')
            ->assertOk()->assertJson(['instance_id' => 'demo', 'status' => 'disconnected']);

        $this->withHeaders($headers)->postJson('/api/v1/instances/demo/connect')
            ->assertOk()->assertJson(['instance_id' => 'demo', 'status' => 'connecting']);

        $result = $this->withHeaders($headers + ['Idempotency-Key' => 'message:key:1'])
            ->postJson('/api/v1/messages/text', [
                'instance_id' => 'demo',
                'to' => '+628123456789',
                'text' => 'Hello',
            ])
            ->assertAccepted()
            ->json();

        self::assertSame('fake-1', $result['message_id']);
        self::assertSame(1, $this->provider->sendCount);
    }

    public function test_idempotent_replay_is_stable_and_conflict_is_rejected(): void
    {
        [$headers] = $this->principalWithInstance('demo');
        $headers += ['Idempotency-Key' => 'message:key:1'];
        $payload = ['instance_id' => 'demo', 'to' => '+628123456789', 'text' => 'Hello'];

        $first = $this->withHeaders($headers)->postJson('/api/v1/messages/text', $payload)
            ->assertAccepted()->json();
        $replay = $this->withHeaders($headers)->postJson('/api/v1/messages/text', $payload)
            ->assertAccepted()->json();

        self::assertSame($first, $replay);
        self::assertSame(1, $this->provider->sendCount);

        $this->withHeaders($headers)->postJson('/api/v1/messages/text', [...$payload, 'text' => 'Changed'])
            ->assertConflict()->assertJsonPath('code', 'IDEMPOTENCY_CONFLICT');
    }

    public function test_unexpected_idempotent_failure_is_terminal_and_replayed_safely(): void
    {
        [, $principal] = $this->principalWithInstance('demo');
        $service = app(IdempotencyService::class);
        $principalId = (string) $principal->getKey();
        $payload = ['instance_id' => 'demo'];

        try {
            $service->run($principalId, 'messages.text', 'failure:key:1', $payload, fn () => throw new \RuntimeException('sensitive provider failure'));
            self::fail('Unexpected callback failure was not converted.');
        } catch (\Throwable $exception) {
            self::assertSame('The request could not be completed.', $exception->getMessage());
        }

        try {
            $service->run($principalId, 'messages.text', 'failure:key:1', $payload, fn () => ['message_id' => 'must-not-run']);
            self::fail('Failed idempotency response was not replayed.');
        } catch (\Throwable $exception) {
            self::assertSame('The request could not be completed.', $exception->getMessage());
        }

        self::assertDatabaseHas('gateway_idempotency_keys', [
            'principal_id' => $principal->getKey(),
            'status' => 'failed',
            'http_status' => 500,
        ]);
    }

    public function test_invalid_payload_returns_safe_error_without_details(): void
    {
        [$headers] = $this->principalWithInstance('demo');

        $response = $this->withHeaders($headers + ['Idempotency-Key' => 'message:key:1'])
            ->postJson('/api/v1/messages/text', [
                'instance_id' => 'demo',
                'to' => 'invalid',
                'text' => '',
            ])
            ->assertUnprocessable()
            ->assertJsonPath('code', 'VALIDATION_FAILED')
            ->assertJsonMissingPath('errors');

        self::assertSame(['code', 'message', 'request_id', 'retryable'], array_keys($response->json()));
    }

    public function test_media_is_explicitly_unavailable(): void
    {
        [$headers] = $this->principalWithInstance('demo');

        $this->withHeaders($headers)->postJson('/api/v1/messages/media')
            ->assertStatus(501)
            ->assertJsonPath('code', 'FEATURE_UNAVAILABLE');
    }

    private function principalWithInstance(string $instance): array
    {
        $keyId = 'test-principal';
        $secret = 'test-secret';
        $principal = ApiPrincipal::query()->create([
            'name' => 'test',
            'key_id' => $keyId,
            'key_hash' => password_hash($secret, PASSWORD_DEFAULT),
            'status' => 'active',
        ]);
        GatewayInstance::query()->create([
            'principal_id' => $principal->getKey(),
            'name' => $instance,
            'status' => 'disconnected',
        ]);

        return [['Authorization' => 'Bearer '.$keyId.'.'.$secret], $principal];
    }
}
