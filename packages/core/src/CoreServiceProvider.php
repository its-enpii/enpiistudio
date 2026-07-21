<?php

declare(strict_types=1);

namespace EnpiiStudio\Core;

use EnpiiStudio\Core\Authorization\AuthorizationService;
use EnpiiStudio\Core\FeatureFlags\FeatureFlags;
use EnpiiStudio\Core\Settings\SettingsRepository;
use EnpiiStudio\Core\Tenancy\TenantContext;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

final class CoreServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->scoped(TenantContext::class);
        $this->app->scoped(AuthorizationService::class);
        $this->app->scoped(SettingsRepository::class);
        $this->app->scoped(FeatureFlags::class);
    }

    public function boot(): void
    {
        // Laravel 12 FPM/CLI HTTP workers reuse the container across requests.
        // Scoped bindings must be flushed at end-of-request or tenant state
        // leaks from request N to N+1 inside the same worker. Without this,
        // TenantContext::run()'s finally block restores $previous (often null),
        // but the same instance is reused next request, so cross-request
        // leakage still occurs for callers that rely on fresh state.
        $this->app->terminating(static function (): void {
            app()->forgetScopedInstances();
        });

        // Force the tenant middleware to run BEFORE AuthenticatesRequests.
        // Without this, Laravel's default priority list places Authenticate
        // (which queries the User model via TenantScope) ahead of the route
        // 'tenant' middleware, so User::query() fires with no context set.
        $this->app->afterResolving(\Illuminate\Contracts\Http\Kernel::class, function ($kernel): void {
            $kernel->prependToMiddlewarePriority(\EnpiiStudio\Core\Tenancy\Middleware\ResolveTenantContext::class);
        });

        Gate::define('enpii.permission', fn ($user, string $permission) => app(AuthorizationService::class)->allow($user, $permission));

        $this->publishes([
            __DIR__.'/../database/migrations/0001_01_01_000000_create_enpii_core_tables.php' => database_path('migrations/0001_01_01_000000_create_enpii_core_tables.php'),
        ], 'enpii-core-migrations');
    }
}
