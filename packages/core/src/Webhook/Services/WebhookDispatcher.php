<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\Webhook\Services;

use EnpiiStudio\Core\Tenancy\TenantContext;
use EnpiiStudio\Core\Webhook\Contracts\WebhookDispatcher as WebhookDispatcherContract;
use EnpiiStudio\Core\Webhook\Enums\WebhookDeliveryStatus;
use EnpiiStudio\Core\Webhook\Jobs\DeliverWebhookJob;
use EnpiiStudio\Core\Webhook\Models\WebhookDelivery;
use EnpiiStudio\Core\Webhook\Models\WebhookEndpoint;

final class WebhookDispatcher implements WebhookDispatcherContract
{
    public function __construct(
        private readonly TenantContext $tenantContext
    ) {}

    public function dispatch(string $event, array $payload, ?string $tenantId = null): void
    {
        $resolvedTenantId = $tenantId ?? ($this->tenantContext->has() ? $this->tenantContext->id() : null);

        $query = WebhookEndpoint::query()->where('status', 'active');

        if ($resolvedTenantId !== null) {
            $query->where('tenant_id', $resolvedTenantId);
        } else {
            $query->whereNull('tenant_id');
        }

        $endpoints = $query->get();

        foreach ($endpoints as $endpoint) {
            if (! $endpoint->isSubscribedTo($event)) {
                continue;
            }

            $delivery = WebhookDelivery::create([
                'endpoint_id' => $endpoint->id,
                'event' => $event,
                'payload' => $payload,
                'status' => WebhookDeliveryStatus::Pending,
                'attempts' => 0,
            ]);

            DeliverWebhookJob::dispatch($delivery);
        }
    }
}
