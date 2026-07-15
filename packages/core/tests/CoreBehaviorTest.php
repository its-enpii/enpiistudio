<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\Tests;

use EnpiiStudio\Core\Audit\AuditWriter;
use EnpiiStudio\Core\Audit\Models\AuditLog;
use EnpiiStudio\Core\FeatureFlags\FeatureFlags;
use EnpiiStudio\Core\Settings\SettingsRepository;
use EnpiiStudio\Core\Tenancy\TenantContext;
use LogicException;

final class CoreBehaviorTest extends TestCase
{
    public function test_settings_and_flags_are_tenant_isolated(): void
    {
        $context = app(TenantContext::class);
        $settings = app(SettingsRepository::class);
        $flags = app(FeatureFlags::class);
        $tenantA = '11111111-1111-4111-8111-111111111111';
        $tenantB = '22222222-2222-4222-8222-222222222222';

        $this->insertTenant($tenantA, 'a');
        $this->insertTenant($tenantB, 'b');

        $context->run($tenantA, function () use ($settings, $flags): void {
            $settings->set('orders.currency', 'IDR');
            $flags->set('orders.new-flow', true);
        });

        self::assertSame('IDR', $context->run($tenantA, fn () => $settings->get('orders.currency')));
        self::assertTrue($context->run($tenantA, fn () => $flags->enabled('orders.new-flow')));
        self::assertNull($context->run($tenantB, fn () => $settings->get('orders.currency')));
        self::assertFalse($context->run($tenantB, fn () => $flags->enabled('orders.new-flow')));
    }

    public function test_audit_redacts_sensitive_fields_and_is_append_only(): void
    {
        $tenant = '11111111-1111-4111-8111-111111111111';
        $this->insertTenant($tenant, 'a');
        $context = app(TenantContext::class);

        $log = $context->run($tenant, function () {
            $record = TestRecord::query()->create(['name' => 'subject']);

            return app(AuditWriter::class)->record('tested', $record, after: [
                'password' => 'secret',
                'token' => 'instance-token',
                'nested' => [
                    'api_key' => 'secret',
                    'authorization' => 'Bearer secret',
                ],
            ]);
        });

        self::assertSame('[REDACTED]', $log->after['password']);
        self::assertSame('[REDACTED]', $log->after['token']);
        self::assertSame('[REDACTED]', $log->after['nested']['api_key']);
        self::assertSame('[REDACTED]', $log->after['nested']['authorization']);

        $this->expectException(LogicException::class);
        $context->run($tenant, fn () => AuditLog::query()->firstOrFail()->delete());
    }

    private function insertTenant(string $id, string $slug): void
    {
        $this->app['db']->table('core_tenants')->insert([
            'id' => $id,
            'name' => strtoupper($slug),
            'slug' => $slug,
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
