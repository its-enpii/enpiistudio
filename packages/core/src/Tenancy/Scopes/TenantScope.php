<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\Tenancy\Scopes;

use EnpiiStudio\Core\Tenancy\TenantContext;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

final readonly class TenantScope implements Scope
{
    public function __construct(private TenantContext $context) {}

    public function apply(Builder $builder, Model $model): void
    {
        $builder->where(
            $model->qualifyColumn($model->getTenantColumn()),
            $this->context->id(),
        );
    }
}
