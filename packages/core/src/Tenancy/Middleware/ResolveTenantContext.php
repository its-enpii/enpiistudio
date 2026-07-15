<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\Tenancy\Middleware;

use Closure;
use EnpiiStudio\Core\Tenancy\Contracts\TenantResolver;
use EnpiiStudio\Core\Tenancy\TenantContext;
use Illuminate\Http\Request;

final readonly class ResolveTenantContext
{
    public function __construct(
        private TenantResolver $resolver,
        private TenantContext $context,
    ) {}

    public function handle(Request $request, Closure $next): mixed
    {
        return $this->context->run(
            $this->resolver->resolveTenantId(),
            fn () => $next($request),
        );
    }
}
