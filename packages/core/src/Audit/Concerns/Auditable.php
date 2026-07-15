<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\Audit\Concerns;

use EnpiiStudio\Core\Audit\AuditWriter;
use Illuminate\Database\Eloquent\Model;

trait Auditable
{
    public static function bootAuditable(): void
    {
        static::created(fn (Model $model) => app(AuditWriter::class)->record('created', $model, after: $model->getAttributes()));
        static::updated(fn (Model $model) => app(AuditWriter::class)->record('updated', $model, $model->getOriginal(), $model->getChanges()));
        static::deleted(fn (Model $model) => app(AuditWriter::class)->record('deleted', $model, before: $model->getOriginal()));
    }
}
