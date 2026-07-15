<?php

declare(strict_types=1);

namespace EnpiiStudio\WhatsAppClient\Tests;

use EnpiiStudio\WhatsAppClient\WhatsAppClientServiceProvider;
use Orchestra\Testbench\TestCase as Orchestra;

abstract class TestCase extends Orchestra
{
    protected function getPackageProviders($app): array
    {
        return [WhatsAppClientServiceProvider::class];
    }

    protected function defineEnvironment($app): void
    {
        $app['config']->set('whatsapp-client.url', 'https://gateway.test/api/v1');
        $app['config']->set('whatsapp-client.api_key', 'test-key');
        $app['config']->set('whatsapp-client.timeout', 2);
        $app['config']->set('whatsapp-client.connect_timeout', 1);
    }
}
