<?php

declare(strict_types=1);

namespace EnpiiStudio\WhatsAppGateway\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

final class ApiPrincipal extends Model
{
    use HasUuids;

    protected $table = 'gateway_api_principals';

    protected $guarded = [];

    protected $hidden = ['key_hash'];
}
