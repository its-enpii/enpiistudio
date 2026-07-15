<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\Tests;

use EnpiiStudio\Core\Tenancy\Exceptions\TenantContextMissing;
use EnpiiStudio\Core\Tenancy\Exceptions\TenantMismatch;
use EnpiiStudio\Core\Tenancy\TenantContext;

final class TenancyTest extends TestCase
{
    public function test_scoped_query_without_context_fails_closed(): void
    {
        $this->expectException(TenantContextMissing::class);

        TestRecord::query()->count();
    }

    public function test_create_assigns_context_and_queries_are_isolated(): void
    {
        $context = app(TenantContext::class);
        $tenantA = '11111111-1111-4111-8111-111111111111';
        $tenantB = '22222222-2222-4222-8222-222222222222';

        $recordA = $context->run($tenantA, fn () => TestRecord::query()->create(['name' => 'A']));
        $context->run($tenantB, fn () => TestRecord::query()->create(['name' => 'B']));

        self::assertSame($tenantA, $recordA->tenant_id);
        self::assertSame(['A'], $context->run($tenantA, fn () => TestRecord::query()->pluck('name')->all()));
        self::assertSame(['B'], $context->run($tenantB, fn () => TestRecord::query()->pluck('name')->all()));
        self::assertFalse($context->has());
    }

    public function test_retrieved_instance_cannot_cross_context(): void
    {
        $context = app(TenantContext::class);
        $tenantA = '11111111-1111-4111-8111-111111111111';
        $tenantB = '22222222-2222-4222-8222-222222222222';
        $record = $context->run($tenantA, fn () => TestRecord::query()->create(['name' => 'A']));

        $context->set($tenantB);
        $this->expectException(TenantMismatch::class);

        $record->delete();
    }

    public function test_explicit_mismatched_tenant_is_rejected(): void
    {
        $context = app(TenantContext::class);
        $context->set('11111111-1111-4111-8111-111111111111');
        $record = new TestRecord(['name' => 'bad']);
        $record->tenant_id = '22222222-2222-4222-8222-222222222222';

        $this->expectException(TenantMismatch::class);

        $record->save();
    }
}
