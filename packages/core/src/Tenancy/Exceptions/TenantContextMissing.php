<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\Tenancy\Exceptions;

use LogicException;

final class TenantContextMissing extends LogicException
{
    public static function make(): self
    {
        return new self('A tenant context is required for tenant-scoped data.');
    }
}
