<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\Tenancy\Contracts;

interface TenantResolver
{
    public function resolveTenantId(): string;
}
