<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\Webhook\Models;

use EnpiiStudio\Core\Tenancy\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class WebhookEndpoint extends Model
{
    use BelongsToTenant;
    use HasUuids;

    protected $table = 'core_webhook_endpoints';

    protected $fillable = [
        'tenant_id',
        'url',
        'secret',
        'events',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'events' => 'array',
        ];
    }

    public function deliveries(): HasMany
    {
        return $this->hasMany(WebhookDelivery::class, 'endpoint_id');
    }

    public function isSubscribedTo(string $event): bool
    {
        $events = $this->events ?? [];

        return in_array('*', $events, true) || in_array($event, $events, true);
    }
}
