<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\Tests;

use EnpiiStudio\Core\Tenancy\TenantContext;
use EnpiiStudio\Core\Tenancy\TenantContext as Context;

final class ScopingAcrossRequestsTest extends TestCase
{
    public function test_scoped_instance_is_flushed_after_request(): void
    {
        $context = app(TenantContext::class);
        $context->set('11111111-1111-4111-8111-111111111111');

        self::assertTrue($context->has());

        // The CoreServiceProvider::boot() hook fires here. After termination,
        // the next container resolution must return a fresh instance.
        $this->app->terminate();

        self::assertFalse(app(TenantContext::class)->has());
    }

    public function test_flushed_context_starts_empty_regardless_of_previous_run_state(): void
    {
        // Mimics the real FPM scenario:
        //   Request N: middleware enters run(), then exits via finally.
        //   Worker processes Request N+1: instance must NOT inherit stale state.
        $context = app(TenantContext::class);
        $tenant = '11111111-1111-4111-8111-111111111111';
        $context->run($tenant, fn () => null);

        $this->app->terminate();

        $fresh = app(TenantContext::class);
        self::assertNotSame($context, $fresh);
        self::assertFalse($fresh->has());
    }

    public function test_terminating_callback_fires_when_app_terminates(): void
    {
        $fired = false;
        $this->app->terminating(static function () use (&$fired): void {
            $fired = true;
        });

        self::assertFalse($fired);
        $this->app->terminate();
        self::assertTrue($fired);
    }

    public function test_existing_tenancy_tests_still_pass_after_fix(): void
    {
        // Sanity: existing flow not regressed. run() still restores $previous
        // on the same instance, and id() still throws when no context is set
        // within run().
        $context = app(Context::class);
        $tenant = '11111111-1111-4111-8111-111111111111';

        $inside = $context->run($tenant, fn () => $context->id());
        self::assertSame($tenant, $inside);
        self::assertFalse($context->has());
    }
}
