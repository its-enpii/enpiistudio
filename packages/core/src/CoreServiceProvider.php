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
        Gate::define('enpii.permission', fn ($user, string $permission) => app(AuthorizationService::class)->allow($user, $permission));

        $this->publishes([
            __DIR__.'/../database/migrations/0001_01_01_000000_create_enpii_core_tables.php' => database_path('migrations/0001_01_01_000000_create_enpii_core_tables.php'),
        ], 'enpii-core-migrations');
    }
}
