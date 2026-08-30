<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\Tests;

use EnpiiStudio\Core\CoreServiceProvider;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Orchestra\Testbench\TestCase as Orchestra;

abstract class TestCase extends Orchestra
{
    protected function getPackageProviders($app): array
    {
        return [CoreServiceProvider::class];
    }

    protected function defineEnvironment($app): void
    {
        $app['config']->set('database.default', 'testing');
        $app['config']->set('database.connections.testing', [
            'driver' => 'sqlite',
            'database' => ':memory:',
            'prefix' => '',
            'foreign_key_constraints' => true,
        ]);
    }

    protected function defineDatabaseMigrations(): void
    {
        $migration = require __DIR__.'/../database/migrations/0001_01_01_000000_create_enpii_core_tables.php';
        $migration->up();

        $mediaMigration = require __DIR__.'/../database/migrations/2026_01_01_000001_create_media_table.php';
        $mediaMigration->up();

        $notificationMigration = require __DIR__.'/../database/migrations/2026_08_30_000000_create_core_notifications_table.php';
        $notificationMigration->up();

        Schema::create('test_records', function (Blueprint $table): void {
            $table->id();
            $table->uuid('tenant_id');
            $table->string('name');
            $table->timestamps();
        });
    }
}
