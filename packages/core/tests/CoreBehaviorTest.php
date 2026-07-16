<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\Tests;

use EnpiiStudio\Core\Audit\AuditWriter;
use EnpiiStudio\Core\Audit\Contracts\AuditActorResolver;
use EnpiiStudio\Core\Audit\Models\AuditLog;
use EnpiiStudio\Core\Authorization\AuthorizationService;
use EnpiiStudio\Core\Authorization\Models\Permission;
use EnpiiStudio\Core\Authorization\Models\Role;
use EnpiiStudio\Core\FeatureFlags\FeatureFlags;
use EnpiiStudio\Core\Identity\Models\User;
use EnpiiStudio\Core\Settings\SettingsRepository;
use EnpiiStudio\Core\Tenancy\Exceptions\TenantMismatch;
use EnpiiStudio\Core\Tenancy\TenantContext;
use Illuminate\Support\Facades\Gate;
use InvalidArgumentException;
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

    public function test_setting_distinguishes_stored_null_from_missing_value(): void
    {
        $tenant = '11111111-1111-4111-8111-111111111111';
        $this->insertTenant($tenant, 'a');
        $context = app(TenantContext::class);
        $settings = app(SettingsRepository::class);

        $context->run($tenant, fn () => $settings->set('orders.optional-label', null));

        self::assertNull($context->run($tenant, fn () => $settings->get('orders.optional-label', 'fallback')));
        self::assertSame('fallback', $context->run($tenant, fn () => $settings->get('orders.missing', 'fallback')));
    }

    public function test_gate_allows_active_user_with_assigned_permission(): void
    {
        $tenant = '11111111-1111-4111-8111-111111111111';
        $this->insertTenant($tenant, 'a');
        $permission = Permission::query()->create(['name' => 'View orders', 'slug' => 'orders.view']);
        $context = app(TenantContext::class);

        [$user] = $context->run($tenant, function () use ($permission): array {
            $user = User::query()->create([
                'name' => 'User',
                'email' => 'user@example.test',
                'password' => 'password',
                'status' => 'active',
            ]);
            $role = Role::query()->create(['name' => 'Operator', 'slug' => 'operator']);
            $authorization = app(AuthorizationService::class);
            $authorization->grantPermission($role, $permission);
            $authorization->assignRole($user, $role);

            return [$user, $role];
        });

        self::assertTrue($context->run(
            $tenant,
            fn () => Gate::forUser($user)->allows('enpii.permission', 'orders.view'),
        ));

        $user->status = 'inactive';
        self::assertFalse($context->run(
            $tenant,
            fn () => Gate::forUser($user)->allows('enpii.permission', 'orders.view'),
        ));
    }

    public function test_role_assignment_rejects_cross_tenant_models(): void
    {
        $tenantA = '11111111-1111-4111-8111-111111111111';
        $tenantB = '22222222-2222-4222-8222-222222222222';
        $this->insertTenant($tenantA, 'a');
        $this->insertTenant($tenantB, 'b');
        $context = app(TenantContext::class);
        $user = $context->run($tenantA, fn () => User::query()->create([
            'name' => 'User',
            'email' => 'user@example.test',
            'password' => 'password',
            'status' => 'active',
        ]));
        $role = $context->run($tenantB, fn () => Role::query()->create([
            'name' => 'Operator',
            'slug' => 'operator',
        ]));

        $this->expectException(TenantMismatch::class);

        $context->run($tenantA, fn () => app(AuthorizationService::class)->assignRole($user, $role));
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

    public function test_audit_rejects_actor_outside_current_tenant(): void
    {
        $tenantA = '11111111-1111-4111-8111-111111111111';
        $tenantB = '22222222-2222-4222-8222-222222222222';
        $this->insertTenant($tenantA, 'a');
        $this->insertTenant($tenantB, 'b');
        $context = app(TenantContext::class);
        $actor = $context->run($tenantB, fn () => User::query()->create([
            'name' => 'Other tenant actor',
            'email' => 'actor@example.test',
            'password' => 'password',
            'status' => 'active',
        ]));
        $this->app->instance(AuditActorResolver::class, new readonly class((string) $actor->getKey()) implements AuditActorResolver
        {
            public function __construct(private string $id) {}

            public function actorId(): ?string
            {
                return $this->id;
            }
        });

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('current tenant');

        $context->run($tenantA, function (): void {
            $record = TestRecord::query()->create(['name' => 'subject']);
            app(AuditWriter::class)->record('tested', $record);
        });
    }

    public function test_audit_rejects_unpersisted_subject(): void
    {
        $context = app(TenantContext::class);
        $context->set('11111111-1111-4111-8111-111111111111');

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('persisted');

        app(AuditWriter::class)->record('tested', new TestRecord(['name' => 'new']));
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
