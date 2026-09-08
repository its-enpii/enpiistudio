<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\Webhook\Models;

use EnpiiStudio\Core\Webhook\Enums\WebhookDeliveryStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class WebhookDelivery extends Model
{
    use HasUuids;

    protected $table = 'core_webhook_deliveries';

    protected $fillable = [
        'endpoint_id',
        'event',
        'payload',
        'status',
        'response_status',
        'response_body',
        'attempts',
    ];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'status' => WebhookDeliveryStatus::class,
            'response_status' => 'integer',
            'attempts' => 'integer',
        ];
    }

    public function endpoint(): BelongsTo
    {
        return $this->belongsTo(WebhookEndpoint::class, 'endpoint_id');
    }
}
