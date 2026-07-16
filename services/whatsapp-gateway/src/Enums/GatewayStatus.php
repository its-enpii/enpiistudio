<?php

declare(strict_types=1);

namespace EnpiiStudio\WhatsAppGateway\Enums;

enum GatewayStatus: string
{
    case Disconnected = 'disconnected';
    case Connecting = 'connecting';
    case Connected = 'connected';
    case Error = 'error';

    public static function fromEvolution(string $state): self
    {
        return match (strtolower($state)) {
            'open', 'connected' => self::Connected,
            'connecting', 'qr_required' => self::Connecting,
            'close', 'disconnected' => self::Disconnected,
            default => self::Error,
        };
    }
}
