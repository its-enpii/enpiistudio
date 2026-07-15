<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\Tenancy;

use Closure;
use EnpiiStudio\Core\Tenancy\Exceptions\TenantContextMissing;
use EnpiiStudio\Core\Tenancy\Exceptions\TenantMismatch;

final class TenantContext
{
    private ?string $tenantId = null;

    public function set(string $tenantId): void
    {
        $tenantId = trim($tenantId);

        if ($tenantId === '') {
            throw TenantContextMissing::make();
        }

        $this->tenantId = $tenantId;
    }

    public function id(): string
    {
        return $this->tenantId ?? throw TenantContextMissing::make();
    }

    public function has(): bool
    {
        return $this->tenantId !== null;
    }

    public function assertMatches(string $tenantId): void
    {
        $expected = $this->id();

        if (! hash_equals($expected, $tenantId)) {
            throw TenantMismatch::forIds($expected, $tenantId);
        }
    }

    public function forget(): void
    {
        $this->tenantId = null;
    }

    public function run(string $tenantId, Closure $callback): mixed
    {
        $previous = $this->tenantId;
        $this->set($tenantId);

        try {
            return $callback();
        } finally {
            $this->tenantId = $previous;
        }
    }
}
