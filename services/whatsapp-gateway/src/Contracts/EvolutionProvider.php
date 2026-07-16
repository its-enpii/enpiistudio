<?php

declare(strict_types=1);

namespace EnpiiStudio\WhatsAppGateway\Contracts;

use EnpiiStudio\WhatsAppGateway\Enums\GatewayStatus;

interface EvolutionProvider
{
    public function status(string $instance): GatewayStatus;

    /** @return array{status: GatewayStatus, qr_code: ?string, pairing_code: ?string} */
    public function connect(string $instance): array;

    public function disconnect(string $instance): GatewayStatus;

    /** @return array{message_id: string, status: string} */
    public function sendText(string $instance, string $to, string $text): array;
}
