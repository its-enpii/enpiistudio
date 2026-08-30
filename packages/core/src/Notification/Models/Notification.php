<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\Notification\Models;

use EnpiiStudio\Core\Tenancy\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

final class Notification extends Model
{
    use BelongsToTenant;
    use HasUuids;

    protected $table = 'core_notifications';

    protected $fillable = ['notifiable_type', 'notifiable_id', 'type', 'title', 'body', 'data', 'read_at'];

    protected function casts(): array
    {
        return ['data' => 'json', 'read_at' => 'datetime'];
    }

    public function notifiable(): MorphTo
    {
        return $this->morphTo();
    }
}
