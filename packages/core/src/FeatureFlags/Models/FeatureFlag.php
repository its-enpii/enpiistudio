<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\FeatureFlags\Models;

use EnpiiStudio\Core\Tenancy\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

final class FeatureFlag extends Model
{
    use BelongsToTenant;
    use HasUuids;

    protected $table = 'core_feature_flags';

    protected $fillable = ['key', 'enabled'];

    protected function casts(): array
    {
        return ['enabled' => 'boolean'];
    }
}
