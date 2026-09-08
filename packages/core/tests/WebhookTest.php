<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\Tests;

use EnpiiStudio\Core\Tenancy\Models\Tenant;
use EnpiiStudio\Core\Tenancy\TenantContext;
use EnpiiStudio\Core\Webhook\Contracts\WebhookDispatcher;
use EnpiiStudio\Core\Webhook\Enums\WebhookDeliveryStatus;
use EnpiiStudio\Core\Webhook\Jobs\DeliverWebhookJob;
use EnpiiStudio\Core\Webhook\Models\WebhookDelivery;
use EnpiiStudio\Core\Webhook\Models\WebhookEndpoint;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Str;

final class WebhookTest extends TestCase
{
    private WebhookDispatcher $dispatcher;

    private TenantContext $tenantContext;

    protected function setUp(): void
    {
        parent::setUp();
        $this->dispatcher = app(WebhookDispatcher::class);
        $this->tenantContext = app(TenantContext::class);
    }

    public function test_dispatches_to_matching_active_endpoints_and_queues_job(): void
    {
        Queue::fake();

        $endpoint1 = WebhookEndpoint::create([
            'id' => (string) Str::uuid(),
            'url' => 'https://example.com/webhook-1',
            'secret' => 'secret-1',
            'events' => ['order.created', 'order.updated'],
            'status' => 'active',
        ]);

        $endpoint2 = WebhookEndpoint::create([
            'id' => (string) Str::uuid(),
            'url' => 'https://example.com/webhook-2',
            'secret' => 'secret-2',
            'events' => ['user.created'],
            'status' => 'active',
        ]);

        $endpoint3 = WebhookEndpoint::create([
            'id' => (string) Str::uuid(),
            'url' => 'https://example.com/webhook-3',
            'secret' => 'secret-3',
            'events' => ['*'],
            'status' => 'active',
        ]);

        $this->dispatcher->dispatch('order.created', ['order_id' => 123]);

        $this->assertDatabaseHas('core_webhook_deliveries', [
            'endpoint_id' => $endpoint1->id,
            'event' => 'order.created',
            'status' => WebhookDeliveryStatus::Pending->value,
        ]);

        $this->assertDatabaseMissing('core_webhook_deliveries', [
            'endpoint_id' => $endpoint2->id,
        ]);

        $this->assertDatabaseHas('core_webhook_deliveries', [
            'endpoint_id' => $endpoint3->id,
            'event' => 'order.created',
            'status' => WebhookDeliveryStatus::Pending->value,
        ]);

        Queue::assertPushed(DeliverWebhookJob::class, 2);
    }

    public function test_skips_inactive_endpoints(): void
    {
        Queue::fake();

        WebhookEndpoint::create([
            'id' => (string) Str::uuid(),
            'url' => 'https://example.com/inactive',
            'secret' => 'secret',
            'events' => ['order.created'],
            'status' => 'inactive',
        ]);

        $this->dispatcher->dispatch('order.created', ['order_id' => 123]);

        $this->assertDatabaseCount('core_webhook_deliveries', 0);
        Queue::assertNothingPushed();
    }

    public function test_filters_by_tenant_in_multitenant_mode(): void
    {
        Queue::fake();

        $tenantA = Tenant::create(['id' => (string) Str::uuid(), 'name' => 'Tenant A', 'slug' => 'tenant-a']);
        $tenantB = Tenant::create(['id' => (string) Str::uuid(), 'name' => 'Tenant B', 'slug' => 'tenant-b']);

        $endpointA = WebhookEndpoint::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $tenantA->id,
            'url' => 'https://example.com/tenant-a',
            'secret' => 'secret-a',
            'events' => ['order.created'],
            'status' => 'active',
        ]);

        $endpointB = WebhookEndpoint::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $tenantB->id,
            'url' => 'https://example.com/tenant-b',
            'secret' => 'secret-b',
            'events' => ['order.created'],
            'status' => 'active',
        ]);

        $standaloneEndpoint = WebhookEndpoint::create([
            'id' => (string) Str::uuid(),
            'url' => 'https://example.com/standalone',
            'secret' => 'secret-standalone',
            'events' => ['order.created'],
            'status' => 'active',
        ]);

        $this->tenantContext->run($tenantA->id, function (): void {
            $this->dispatcher->dispatch('order.created', ['data' => 'tenant-a-data']);
        });

        $this->assertDatabaseHas('core_webhook_deliveries', [
            'endpoint_id' => $endpointA->id,
        ]);
        $this->assertDatabaseMissing('core_webhook_deliveries', [
            'endpoint_id' => $endpointB->id,
        ]);
        $this->assertDatabaseMissing('core_webhook_deliveries', [
            'endpoint_id' => $standaloneEndpoint->id,
        ]);

        Queue::assertPushed(DeliverWebhookJob::class, 1);
    }

    public function test_explicit_tenant_id_argument_overrides_or_sets_scope(): void
    {
        Queue::fake();

        $tenantA = Tenant::create(['id' => (string) Str::uuid(), 'name' => 'Tenant A', 'slug' => 'tenant-a']);

        $endpointA = WebhookEndpoint::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $tenantA->id,
            'url' => 'https://example.com/tenant-a',
            'secret' => 'secret-a',
            'events' => ['order.created'],
            'status' => 'active',
        ]);

        $this->dispatcher->dispatch('order.created', ['foo' => 'bar'], $tenantA->id);

        $this->assertDatabaseHas('core_webhook_deliveries', [
            'endpoint_id' => $endpointA->id,
        ]);
    }

    public function test_successful_delivery_records_signature_headers_and_updates_status(): void
    {
        $secret = 'super-secret-key';
        $payload = ['event' => 'invoice.paid', 'amount' => 50000];

        $endpoint = WebhookEndpoint::create([
            'id' => (string) Str::uuid(),
            'url' => 'https://api.partner.com/webhook',
            'secret' => $secret,
            'events' => ['invoice.paid'],
            'status' => 'active',
        ]);

        $delivery = WebhookDelivery::create([
            'id' => (string) Str::uuid(),
            'endpoint_id' => $endpoint->id,
            'event' => 'invoice.paid',
            'payload' => $payload,
            'status' => WebhookDeliveryStatus::Pending,
            'attempts' => 0,
        ]);

        $expectedJson = json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        $expectedSignature = hash_hmac('sha256', (string) $expectedJson, $secret);

        Http::fake([
            'https://api.partner.com/webhook' => Http::response(['received' => true], 200),
        ]);

        $job = new DeliverWebhookJob($delivery);
        $job->handle();

        Http::assertSent(function (Request $request) use ($endpoint, $delivery, $expectedSignature, $expectedJson): bool {
            return $request->url() === $endpoint->url
                && $request->header('X-Webhook-Signature')[0] === $expectedSignature
                && $request->header('X-Webhook-Event')[0] === 'invoice.paid'
                && $request->header('X-Webhook-Delivery-Id')[0] === (string) $delivery->id
                && $request->header('Content-Type')[0] === 'application/json'
                && $request->body() === $expectedJson;
        });

        $delivery->refresh();
        $this->assertEquals(WebhookDeliveryStatus::Success, $delivery->status);
        $this->assertEquals(200, $delivery->response_status);
        $this->assertStringContainsString('received', (string) $delivery->response_body);
        $this->assertEquals(1, $delivery->attempts);
    }

    public function test_failed_delivery_records_failure_status_and_response(): void
    {
        $endpoint = WebhookEndpoint::create([
            'id' => (string) Str::uuid(),
            'url' => 'https://api.partner.com/failing-webhook',
            'secret' => 'secret-123',
            'events' => ['user.deleted'],
            'status' => 'active',
        ]);

        $delivery = WebhookDelivery::create([
            'id' => (string) Str::uuid(),
            'endpoint_id' => $endpoint->id,
            'event' => 'user.deleted',
            'payload' => ['user_id' => 'u123'],
            'status' => WebhookDeliveryStatus::Pending,
            'attempts' => 0,
        ]);

        Http::fake([
            'https://api.partner.com/failing-webhook' => Http::response('Internal Server Error', 500),
        ]);

        $job = new DeliverWebhookJob($delivery);
        $job->handle();

        $delivery->refresh();
        $this->assertEquals(WebhookDeliveryStatus::Failed, $delivery->status);
        $this->assertEquals(500, $delivery->response_status);
        $this->assertEquals('Internal Server Error', $delivery->response_body);
        $this->assertEquals(1, $delivery->attempts);
    }

    public function test_exception_during_delivery_marks_status_failed(): void
    {
        $endpoint = WebhookEndpoint::create([
            'id' => (string) Str::uuid(),
            'url' => 'https://api.partner.com/timeout',
            'secret' => 'secret-123',
            'events' => ['user.deleted'],
            'status' => 'active',
        ]);

        $delivery = WebhookDelivery::create([
            'id' => (string) Str::uuid(),
            'endpoint_id' => $endpoint->id,
            'event' => 'user.deleted',
            'payload' => ['user_id' => 'u123'],
            'status' => WebhookDeliveryStatus::Pending,
            'attempts' => 0,
        ]);

        Http::fake([
            'https://api.partner.com/timeout' => fn () => throw new \Exception('Connection timeout'),
        ]);

        $job = new DeliverWebhookJob($delivery);
        $job->handle();

        $delivery->refresh();
        $this->assertEquals(WebhookDeliveryStatus::Failed, $delivery->status);
        $this->assertNull($delivery->response_status);
        $this->assertStringContainsString('Connection timeout', (string) $delivery->response_body);
        $this->assertEquals(1, $delivery->attempts);
    }
}
