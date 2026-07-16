<?php

declare(strict_types=1);

namespace EnpiiStudio\WhatsAppGateway\Services;

use EnpiiStudio\WhatsAppGateway\Exceptions\GatewayApiException;
use EnpiiStudio\WhatsAppGateway\Models\ApiPrincipal;
use EnpiiStudio\WhatsAppGateway\Models\GatewayInstance;

final class InstanceAccess
{
    public function resolve(ApiPrincipal $principal, string $name): GatewayInstance
    {
        $instance = GatewayInstance::query()->where('name', $name)->first();

        if ($instance === null) {
            throw new GatewayApiException('INSTANCE_NOT_FOUND', 'Instance was not found.', 404);
        }

        if (! hash_equals((string) $principal->getKey(), (string) $instance->principal_id)) {
            throw new GatewayApiException('INSTANCE_FORBIDDEN', 'Instance is not available to this principal.', 403);
        }

        return $instance;
    }
}
