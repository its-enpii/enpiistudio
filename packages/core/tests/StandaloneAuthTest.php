<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\Tests;

use EnpiiStudio\Core\Audit\AuditWriter;
use EnpiiStudio\Core\Audit\Contracts\AuditActorResolver;
use EnpiiStudio\Core\Audit\Models\AuditLog;
use EnpiiStudio\Core\Authorization\AuthorizationService;
use EnpiiStudio\Core\Authorization\Models\Permission;
use EnpiiStudio\Core\Authorization\Models\Role;
use EnpiiStudio\Core\Identity\Models\User;
use EnpiiStudio\Core\Tenancy\Exceptions\TenantMismatch;
use EnpiiStudio\Core\Tenancy\TenantContext;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use InvalidArgumentException;

final class StandaloneAuthTest extends TestCase
{
    public function test_standalone_user_creation_and_auth_simulation(): void
    {
        $context = app(TenantContext::class);
        self::assertFalse($context->has());

        $user = User::query()->create([
            'name' => 'Standalone Admin',
            'email' => 'admin@standalone.test',
            'password' => 'secret123',
            'status' => 'active',
        ]);

        self::assertNull($user->tenant_id);
        self::assertNotNull($user->id);
        self::assertTrue(Hash::check('secret123', $user->password));

        $found = User::query()->where('email', 'admin@standalone.test')->first();
        self::assertNotNull($found);
        self::assertSame($user->id, $found->id);

        Auth::login($user);
        self::assertTrue(Auth::check());
        self::assertSame($user->id, Auth::id());
        self::assertSame('admin@standalone.test', Auth::user()?->email);

        $user->update(['name' => 'Updated Admin']);
        self::assertSame('Updated Admin', $user->fresh()->name);
    }

    public function test_standalone_role_and_permission_assignment(): void
    {
        $context = app(TenantContext::class);
        self::assertFalse($context->has());

        $user = User::query()->create([
            'name' => 'Standalone Operator',
            'email' => 'operator@standalone.test',
            'password' => 'password',
            'status' => 'active',
        ]);

        $role = Role::query()->create([
            'name' => 'Manager',
            'slug' => 'manager',
        ]);

        $permission = Permission::query()->create([
            'name' => 'Manage Inventory',
            'slug' => 'inventory.manage',
        ]);

        self::assertNull($role->tenant_id);

        $authorization = app(AuthorizationService::class);
        $authorization->grantPermission($role, $permission);
        $authorization->assignRole($user, $role);

        self::assertTrue($user->hasRole('manager'));
        self::assertTrue($user->hasPermission('inventory.manage'));
        self::assertFalse($user->hasRole('admin'));
        self::assertFalse($user->hasPermission('users.manage'));

        $this->assertDatabaseHas('core_role_user', [
            'user_id' => $user->id,
            'role_id' => $role->id,
            'tenant_id' => null,
        ]);
    }

    public function test_standalone_gate_authorization_checks(): void
    {
        $context = app(TenantContext::class);
        self::assertFalse($context->has());

        $user = User::query()->create([
            'name' => 'Active User',
            'email' => 'active@standalone.test',
            'password' => 'password',
            'status' => 'active',
        ]);

        $role = Role::query()->create([
            'name' => 'Editor',
            'slug' => 'editor',
        ]);

        $permission = Permission::query()->create([
            'name' => 'Edit Posts',
            'slug' => 'posts.edit',
        ]);

        $authorization = app(AuthorizationService::class);
        $authorization->grantPermission($role, $permission);
        $authorization->assignRole($user, $role);

        self::assertTrue(Gate::forUser($user)->allows('enpii.permission', 'posts.edit'));
        self::assertFalse(Gate::forUser($user)->allows('enpii.permission', 'posts.delete'));

        $user->update(['status' => 'inactive']);
        self::assertFalse(Gate::forUser($user)->allows('enpii.permission', 'posts.edit'));
    }

    public function test_standalone_audit_writer_records_without_tenant_context(): void
    {
        $context = app(TenantContext::class);
        self::assertFalse($context->has());

        $actor = User::query()->create([
            'name' => 'Audit Actor',
            'email' => 'actor@standalone.test',
            'password' => 'password',
            'status' => 'active',
        ]);

        $this->app->instance(AuditActorResolver::class, new readonly class((string) $actor->getKey()) implements AuditActorResolver
        {
            public function __construct(private string $id) {}

            public function actorId(): ?string
            {
                return $this->id;
            }
        });

        $subject = User::query()->create([
            'name' => 'Target User',
            'email' => 'target@standalone.test',
            'password' => 'password',
            'status' => 'active',
        ]);

        $writer = app(AuditWriter::class);
        $log = $writer->record('user.created', $subject, after: [
            'name' => 'Target User',
            'password' => 'secret_raw',
            'token' => 'access_tok',
        ]);

        self::assertNull($log->tenant_id);
        self::assertSame($actor->id, $log->actor_id);
        self::assertSame('user.created', $log->action);
        self::assertSame($subject->id, $log->subject_id);
        self::assertSame('[REDACTED]', $log->after['password']);
        self::assertSame('[REDACTED]', $log->after['token']);
        self::assertSame('Target User', $log->after['name']);

        $retrieved = AuditLog::query()->where('id', $log->id)->first();
        self::assertNotNull($retrieved);
        self::assertNull($retrieved->tenant_id);
    }

    public function test_standalone_audit_writer_rejects_nonexistent_actor(): void
    {
        $this->app->instance(AuditActorResolver::class, new readonly class('non-existent-actor-id') implements AuditActorResolver
        {
            public function __construct(private string $id) {}

            public function actorId(): ?string
            {
                return $this->id;
            }
        });

        $subject = User::query()->create([
            'name' => 'Subject',
            'email' => 'sub@standalone.test',
            'password' => 'password',
            'status' => 'active',
        ]);

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('current tenant');

        app(AuditWriter::class)->record('tested', $subject);
    }

    public function test_interoperability_between_standalone_and_multitenant_mode(): void
    {
        $context = app(TenantContext::class);
        $authorization = app(AuthorizationService::class);

        // 1. Create Standalone entities (tenant_id = null)
        $standaloneUser = User::query()->create([
            'name' => 'Standalone User',
            'email' => 'standalone@test.local',
            'password' => 'password',
            'status' => 'active',
        ]);
        $standaloneRole = Role::query()->create([
            'name' => 'Standalone Role',
            'slug' => 'standalone-role',
        ]);
        $perm = Permission::query()->create([
            'name' => 'Action',
            'slug' => 'app.action',
        ]);
        $authorization->grantPermission($standaloneRole, $perm);
        $authorization->assignRole($standaloneUser, $standaloneRole);

        self::assertNull($standaloneUser->tenant_id);
        self::assertTrue(Gate::forUser($standaloneUser)->allows('enpii.permission', 'app.action'));

        // 2. Switch to Tenant 1
        $tenant1 = '11111111-1111-4111-8111-111111111111';
        $tenant2 = '22222222-2222-4222-8222-222222222222';
        $this->insertTenant($tenant1, 'tenant-one');
        $this->insertTenant($tenant2, 'tenant-two');

        $tenantUser1 = $context->run($tenant1, function () use ($authorization, $perm): User {
            $user = User::query()->create([
                'name' => 'Tenant 1 User',
                'email' => 't1@test.local',
                'password' => 'password',
                'status' => 'active',
            ]);
            $role = Role::query()->create([
                'name' => 'Tenant 1 Role',
                'slug' => 't1-role',
            ]);
            $authorization->grantPermission($role, $perm);
            $authorization->assignRole($user, $role);

            return $user;
        });

        self::assertSame($tenant1, $tenantUser1->tenant_id);

        // Tenant 1 only sees its own users
        $tenant1UserEmails = $context->run($tenant1, fn () => User::query()->pluck('email')->all());
        self::assertSame(['t1@test.local'], $tenant1UserEmails);

        // Tenant 2 sees no users
        $tenant2UserEmails = $context->run($tenant2, fn () => User::query()->pluck('email')->all());
        self::assertSame([], $tenant2UserEmails);

        // Gate check in Tenant 1 context
        self::assertTrue($context->run($tenant1, fn () => Gate::forUser($tenantUser1)->allows('enpii.permission', 'app.action')));

        // Cross-tenant operation throws TenantMismatch
        $this->expectException(TenantMismatch::class);
        $context->run($tenant2, fn () => $tenantUser1->delete());
    }

    public function test_cross_tenant_role_assignment_rejected_outside_context(): void
    {
        $tenant1 = '11111111-1111-4111-8111-111111111111';
        $tenant2 = '22222222-2222-4222-8222-222222222222';
        $this->insertTenant($tenant1, 'tenant-one');
        $this->insertTenant($tenant2, 'tenant-two');

        $context = app(TenantContext::class);
        $user1 = $context->run($tenant1, fn () => User::query()->create([
            'name' => 'T1 User',
            'email' => 't1@example.com',
            'password' => 'password',
            'status' => 'active',
        ]));
        $role2 = $context->run($tenant2, fn () => Role::query()->create([
            'name' => 'T2 Role',
            'slug' => 't2-role',
        ]));

        self::assertFalse($context->has());

        $this->expectException(TenantMismatch::class);
        app(AuthorizationService::class)->assignRole($user1, $role2);
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
