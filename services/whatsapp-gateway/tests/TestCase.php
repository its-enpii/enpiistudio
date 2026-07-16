<?php

declare(strict_types=1);

namespace EnpiiStudio\WhatsAppGateway\Tests;

use EnpiiStudio\WhatsAppGateway\Contracts\EvolutionProvider;
use EnpiiStudio\WhatsAppGateway\Fakes\FakeEvolutionProvider;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\TestCase as LaravelTestCase;

abstract class TestCase extends LaravelTestCase
{
    use RefreshDatabase;

    protected FakeEvolutionProvider $provider;

    public function createApplication(): Application
    {
        $this->traitsUsedByTest = array_flip(class_uses_recursive(static::class));
        $app = require __DIR__.'/../bootstrap/app.php';
        $app->make(Kernel::class)->bootstrap();

        $this->provider = new FakeEvolutionProvider;
        $app->instance(EvolutionProvider::class, $this->provider);

        return $app;
    }
}
