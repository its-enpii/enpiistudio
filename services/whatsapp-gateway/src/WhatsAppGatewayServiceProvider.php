<?php

declare(strict_types=1);

namespace EnpiiStudio\WhatsAppGateway;

use EnpiiStudio\WhatsAppGateway\Contracts\EvolutionProvider;
use EnpiiStudio\WhatsAppGateway\Fakes\FakeEvolutionProvider;
use EnpiiStudio\WhatsAppGateway\Http\EvolutionHttpProvider;
use EnpiiStudio\WhatsAppGateway\Models\ApiPrincipal;
use EnpiiStudio\WhatsAppGateway\Services\IdempotencyService;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\ConnectionInterface;
use Illuminate\Http\Client\Factory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use InvalidArgumentException;

final class WhatsAppGatewayServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(EvolutionProvider::class, function ($app): EvolutionProvider {
            return match (config('services.evolution.driver', 'http')) {
                'fake' => new FakeEvolutionProvider,
                'http' => new EvolutionHttpProvider(
                    $app->make(Factory::class),
                    (string) config('services.evolution.url'),
                    (string) config('services.evolution.api_key'),
                    (int) config('services.evolution.timeout', 10),
                ),
                default => throw new InvalidArgumentException('Unsupported Evolution API driver.'),
            };
        });

        $this->app->singleton(IdempotencyService::class, fn ($app) => new IdempotencyService(
            $app->make(ConnectionInterface::class),
        ));
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../database/migrations');

        RateLimiter::for('gateway', function (Request $request): Limit {
            $principal = $request->attributes->get('principal');
            $key = $principal instanceof ApiPrincipal ? (string) $principal->getKey() : $request->ip();

            return Limit::perMinute((int) config('services.gateway.rate_limit', 60))->by($key);
        });
    }
}
