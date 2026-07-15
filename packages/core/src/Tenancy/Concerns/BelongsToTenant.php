<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\Tenancy\Concerns;

use EnpiiStudio\Core\Tenancy\Models\Tenant;
use EnpiiStudio\Core\Tenancy\Scopes\TenantScope;
use EnpiiStudio\Core\Tenancy\TenantContext;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

trait BelongsToTenant
{
    public static function bootBelongsToTenant(): void
    {
        static::addGlobalScope(new TenantScope(app(TenantContext::class)));

        static::creating(function (Model $model): void {
            $context = app(TenantContext::class);
            $column = $model->getTenantColumn();
            $tenantId = $model->getAttribute($column);

            if ($tenantId === null || $tenantId === '') {
                $model->setAttribute($column, $context->id());

                return;
            }

            $context->assertMatches((string) $tenantId);
        });

        $assertTenant = static function (Model $model): void {
            $context = app(TenantContext::class);
            $column = $model->getTenantColumn();
            $tenantId = $model->getAttribute($column);

            if ($tenantId !== null && $tenantId !== '') {
                $context->assertMatches((string) $tenantId);
            }

            if ($model->exists && $model->getOriginal($column) !== null) {
                $context->assertMatches((string) $model->getOriginal($column));
            }
        };

        static::retrieved($assertTenant);
        static::saving($assertTenant);
        static::deleting($assertTenant);
        static::replicating($assertTenant);
    }

    public function getTenantColumn(): string
    {
        return 'tenant_id';
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class, $this->getTenantColumn());
    }
}
