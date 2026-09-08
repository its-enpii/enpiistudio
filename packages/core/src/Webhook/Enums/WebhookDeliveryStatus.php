<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\Webhook\Enums;

enum WebhookDeliveryStatus: string
{
    case Pending = 'pending';
    case Success = 'success';
    case Failed = 'failed';
}
