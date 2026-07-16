<?php

declare(strict_types=1);

namespace EnpiiStudio\WhatsAppClient\Enums;

enum GatewayStatus: string
{
    case Disconnected = 'disconnected';
    case Connecting = 'connecting';
    case Connected = 'connected';
    case Error = 'error';

    public function isConnected(): bool
    {
        return $this === self::Connected;
    }
}
