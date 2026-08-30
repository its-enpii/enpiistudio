<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\Media\Models;

use EnpiiStudio\Core\Tenancy\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

final class Media extends Model
{
    use BelongsToTenant;
    use HasUuids;

    protected $table = 'media';

    protected $fillable = [
        'disk',
        'path',
        'filename',
        'original_name',
        'mime_type',
        'size',
        'title',
        'alt',
        'meta',
    ];

    protected function casts(): array
    {
        return [
            'size' => 'integer',
            'meta' => 'array',
        ];
    }
}
