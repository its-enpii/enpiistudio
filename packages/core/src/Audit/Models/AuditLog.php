<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\Audit\Models;

use EnpiiStudio\Core\Tenancy\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use LogicException;

final class AuditLog extends Model
{
    use BelongsToTenant;
    use HasUuids;

    public const UPDATED_AT = null;

    protected $table = 'core_audit_logs';

    protected $fillable = [
        'tenant_id',
        'actor_id',
        'action',
        'subject_type',
        'subject_id',
        'before',
        'after',
        'metadata',
    ];

    protected static function booted(): void
    {
        self::updating(fn () => throw new LogicException('Audit logs are append-only.'));
        self::deleting(fn () => throw new LogicException('Audit logs are append-only.'));
    }

    protected function casts(): array
    {
        return [
            'before' => 'json',
            'after' => 'json',
            'metadata' => 'json',
            'created_at' => 'immutable_datetime',
        ];
    }
}
