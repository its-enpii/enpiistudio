<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\Webhook\Contracts;

interface WebhookDispatcher
{
    /**
     * Dispatch an outbound webhook event to subscribed endpoints.
     *
     * @param  array<string, mixed>  $payload
     */
    public function dispatch(string $event, array $payload, ?string $tenantId = null): void;
}
