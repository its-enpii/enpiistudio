<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\Settings\Models;

use EnpiiStudio\Core\Tenancy\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

final class Setting extends Model
{
    use BelongsToTenant;
    use HasUuids;

    protected $table = 'core_settings';

    protected $fillable = ['key', 'value'];

    protected function casts(): array
    {
        return ['value' => 'json'];
    }
}
