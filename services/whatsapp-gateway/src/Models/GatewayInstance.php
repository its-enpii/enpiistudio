<?php

declare(strict_types=1);

namespace EnpiiStudio\WhatsAppGateway\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

final class GatewayInstance extends Model
{
    use HasUuids;

    protected $table = 'gateway_instances';

    protected $guarded = [];

    protected $hidden = ['provider_token'];

    protected function casts(): array
    {
        return ['provider_token' => 'encrypted'];
    }
}
