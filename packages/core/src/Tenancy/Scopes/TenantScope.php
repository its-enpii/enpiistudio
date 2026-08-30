<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\Tenancy\Scopes;

use EnpiiStudio\Core\Tenancy\TenantContext;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

final readonly class TenantScope implements Scope
{
    public function __construct(private ?TenantContext $context = null) {}

    public function apply(Builder $builder, Model $model): void
    {
        $context = app(TenantContext::class);

        $builder->where(
            $model->qualifyColumn($model->getTenantColumn()),
            $context->id(),
        );
    }
}
