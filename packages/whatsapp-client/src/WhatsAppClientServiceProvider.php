<?php

declare(strict_types=1);

namespace EnpiiStudio\WhatsAppClient;

use EnpiiStudio\WhatsAppClient\Commands\GatewayConnectCommand;
use EnpiiStudio\WhatsAppClient\Commands\GatewaySmokeCommand;
use EnpiiStudio\WhatsAppClient\Contracts\WhatsAppGateway;
use EnpiiStudio\WhatsAppClient\Http\HttpWhatsAppGateway;
use Illuminate\Http\Client\Factory;
use Illuminate\Support\ServiceProvider;

final class WhatsAppClientServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__.'/../config/whatsapp-client.php', 'whatsapp-client');

        $this->app->singleton(WhatsAppGateway::class, fn ($app) => new HttpWhatsAppGateway(
            http: $app->make(Factory::class),
            baseUrl: (string) $app['config']->get('whatsapp-client.url'),
            apiKey: (string) $app['config']->get('whatsapp-client.api_key'),
            timeout: (int) $app['config']->get('whatsapp-client.timeout'),
            connectTimeout: (int) $app['config']->get('whatsapp-client.connect_timeout'),
        ));
    }

    public function boot(): void
    {
        $this->publishes([
            __DIR__.'/../config/whatsapp-client.php' => config_path('whatsapp-client.php'),
        ], 'whatsapp-client-config');

        if ($this->app->runningInConsole()) {
            $this->commands([GatewayConnectCommand::class, GatewaySmokeCommand::class]);
        }
    }
}
