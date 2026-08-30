<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\Tests;

use EnpiiStudio\Core\Identity\Models\User;
use EnpiiStudio\Core\Notification\Contracts\NotificationCenter;
use EnpiiStudio\Core\Notification\Http\Controllers\NotificationController;
use EnpiiStudio\Core\Notification\Models\Notification;
use EnpiiStudio\Core\Tenancy\Contracts\TenantResolver;
use EnpiiStudio\Core\Tenancy\Exceptions\TenantContextMissing;
use EnpiiStudio\Core\Tenancy\Middleware\ResolveTenantContext;
use EnpiiStudio\Core\Tenancy\TenantContext;
use Illuminate\Support\Facades\Route;

final class NotificationTest extends TestCase
{
    protected function defineEnvironment($app): void
    {
        $app['config']->set('app.key', 'base64:'.base64_encode(random_bytes(32)));
        $app->singleton(TenantResolver::class, function () {
            return new class implements TenantResolver
            {
                public function resolveTenantId(): string
                {
                    return '11111111-1111-4111-8111-111111111111';
                }
            };
        });
    }

    public function test_send_and_unread_count_are_tenant_scoped(): void
    {
        $context = app(TenantContext::class);
        $center = app(NotificationCenter::class);
        $tenantA = '11111111-1111-4111-8111-111111111111';
        $tenantB = '22222222-2222-4222-8222-222222222222';
        $this->insertTenant($tenantA, 'a');
        $this->insertTenant($tenantB, 'b');

        $user = $this->createUser($tenantA);

        $notification = $context->run($tenantA, fn () => $center->send(
            $user,
            'order.paid',
            'Order paid',
            'Your order has been paid.',
            ['order_id' => 'order-1'],
        ));

        self::assertSame($tenantA, $notification->tenant_id);
        self::assertSame($user->getKey(), (string) $notification->notifiable_id);
        self::assertSame('order.paid', $notification->type);
        self::assertSame(['order_id' => 'order-1'], $notification->data);
        self::assertNull($notification->read_at);
        self::assertSame(1, $context->run($tenantA, fn () => $center->unreadCountFor($user)));
        self::assertSame(0, $context->run($tenantB, fn () => $center->unreadCountFor($user)));
        self::assertSame([], $context->run($tenantB, fn () => Notification::query()->get()->all()));
    }

    public function test_mark_read_is_idempotent(): void
    {
        $context = app(TenantContext::class);
        $center = app(NotificationCenter::class);
        $tenant = '11111111-1111-4111-8111-111111111111';
        $this->insertTenant($tenant, 'a');
        $user = $this->createUser($tenant);

        $notification = $context->run($tenant, fn () => $center->send($user, 'order.paid', 'Order paid', 'Body'));
        $markedAt = $context->run($tenant, fn () => $center->markRead($notification)->read_at);

        $context->run($tenant, fn () => $center->markRead($notification->fresh()));

        self::assertNotNull($markedAt);
        self::assertSame($markedAt->format('U'), $context->run($tenant, fn () => $notification->fresh()->read_at?->format('U')));
    }

    public function test_mark_all_read_updates_only_current_notifiable(): void
    {
        $context = app(TenantContext::class);
        $center = app(NotificationCenter::class);
        $tenant = '11111111-1111-4111-8111-111111111111';
        $this->insertTenant($tenant, 'a');
        $firstUser = $this->createUser($tenant);
        $secondUser = $this->createUser($tenant, 'second@example.com');

        $context->run($tenant, function () use ($center, $firstUser, $secondUser): void {
            $center->send($firstUser, 'order.paid', 'First', 'Body');
            $center->send($firstUser, 'order.shipped', 'Second', 'Body');
            $center->send($secondUser, 'order.paid', 'Other user', 'Body');
            $center->markAllReadFor($firstUser);
        });

        self::assertSame(0, $context->run($tenant, fn () => $center->unreadCountFor($firstUser)));
        self::assertSame(1, $context->run($tenant, fn () => $center->unreadCountFor($secondUser)));
    }

    public function test_query_without_tenant_context_fails_closed(): void
    {
        $this->expectException(TenantContextMissing::class);

        Notification::query()->count();
    }

    public function test_index_filter_and_unread_count_endpoint(): void
    {
        $this->registerRoutes();
        $context = app(TenantContext::class);
        $center = app(NotificationCenter::class);
        $tenant = '11111111-1111-4111-8111-111111111111';
        $this->insertTenant($tenant, 'a');
        $user = $this->createUser($tenant);

        $context->run($tenant, function () use ($center, $user): void {
            $center->send($user, 'order.paid', 'Unread', 'Body');
            $center->send($user, 'order.shipped', 'Read', 'Body');
            Notification::query()
                ->where('notifiable_type', $user->getMorphClass())
                ->where('notifiable_id', $user->getKey())
                ->latest('created_at')
                ->first()
                ->update(['read_at' => now()]);
        });

        $this->actingAs($user)
            ->getJson('/api/v1/notifications?unread=1')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Read')
            ->assertJsonPath('meta.per_page', 25);

        $context->set('11111111-1111-4111-8111-111111111111');

        $this->actingAs($user)
            ->getJson('/api/v1/notifications/unread-count')
            ->assertOk()
            ->assertJsonPath('count', 1);
    }

    public function test_mark_read_endpoint(): void
    {
        $this->registerRoutes();
        $context = app(TenantContext::class);
        $center = app(NotificationCenter::class);
        $tenant = '11111111-1111-4111-8111-111111111111';
        $this->insertTenant($tenant, 'a');
        $user = $this->createUser($tenant);
        $notification = $context->run($tenant, fn () => $center->send($user, 'order.paid', 'Order paid', 'Body'));

        $this->actingAs($user)
            ->postJson("/api/v1/notifications/{$notification->getKey()}/mark-read")
            ->assertOk()
            ->assertJsonPath('read_at', fn (mixed $readAt): bool => $readAt !== null);
    }

    public function test_mark_all_read_endpoint(): void
    {
        $this->registerRoutes();
        $context = app(TenantContext::class);
        $center = app(NotificationCenter::class);
        $tenant = '11111111-1111-4111-8111-111111111111';
        $this->insertTenant($tenant, 'a');
        $user = $this->createUser($tenant);

        $context->run($tenant, fn () => $center->send($user, 'order.paid', 'Order paid', 'Body'));

        $this->actingAs($user)->postJson('/api/v1/notifications/mark-all-read')->assertOk()->assertJsonPath('count', 0);
        self::assertSame(0, $context->run($tenant, fn () => $center->unreadCountFor($user)));
    }

    public function test_user_cannot_mark_another_notifiable_notification_read(): void
    {
        $this->registerRoutes();
        $context = app(TenantContext::class);
        $center = app(NotificationCenter::class);
        $tenant = '11111111-1111-4111-8111-111111111111';
        $this->insertTenant($tenant, 'a');
        $actor = $this->createUser($tenant);
        $owner = $this->createUser($tenant, 'owner@example.com');
        $notification = $context->run($tenant, fn () => $center->send($owner, 'order.paid', 'Order paid', 'Body'));

        $this->actingAs($actor)->postJson("/api/v1/notifications/{$notification->getKey()}/mark-read")->assertNotFound();
    }

    private function registerRoutes(): void
    {
        Route::prefix('api/v1/notifications')
            ->middleware([ResolveTenantContext::class, 'auth'])
            ->group(function (): void {
                Route::get('/', [NotificationController::class, 'index']);
                Route::get('unread-count', [NotificationController::class, 'unreadCount']);
                Route::post('{id}/mark-read', [NotificationController::class, 'markRead']);
                Route::post('mark-all-read', [NotificationController::class, 'markAllRead']);
            });
    }

    private function createUser(string $tenantId, string $email = 'user@example.com'): User
    {
        return app(TenantContext::class)->run($tenantId, fn () => User::query()->create([
            'name' => 'Test User',
            'email' => $email,
            'password' => 'password',
        ]));
    }

    private function insertTenant(string $tenantId, string $slug): void
    {
        $this->app['db']->table('core_tenants')->insert([
            'id' => $tenantId,
            'name' => ucfirst($slug),
            'slug' => $slug,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
