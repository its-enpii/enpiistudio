<?php

declare(strict_types=1);

namespace EnpiiStudio\WhatsAppClient\Contracts;

use EnpiiStudio\WhatsAppClient\DTOs\ConnectionResult;
use EnpiiStudio\WhatsAppClient\DTOs\InstanceStatus;
use EnpiiStudio\WhatsAppClient\DTOs\MediaMessage;
use EnpiiStudio\WhatsAppClient\DTOs\SendResult;
use EnpiiStudio\WhatsAppClient\DTOs\TextMessage;

interface WhatsAppGateway
{
    public function sendText(TextMessage $message): SendResult;

    public function sendMedia(MediaMessage $message): SendResult;

    public function status(string $instanceId): InstanceStatus;

    public function connect(string $instanceId): ConnectionResult;

    public function disconnect(string $instanceId): InstanceStatus;
}
