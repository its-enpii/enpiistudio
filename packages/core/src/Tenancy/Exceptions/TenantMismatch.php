<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\Tenancy\Exceptions;

use LogicException;

final class TenantMismatch extends LogicException
{
    public static function forIds(string $expected, string $actual): self
    {
        return new self("Tenant mismatch: expected [{$expected}], received [{$actual}].");
    }
}
