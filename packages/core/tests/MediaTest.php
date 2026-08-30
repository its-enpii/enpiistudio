<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\Tests;

use EnpiiStudio\Core\Media\MediaManager;
use EnpiiStudio\Core\Media\Models\Media;
use EnpiiStudio\Core\Tenancy\Contracts\TenantResolver;
use EnpiiStudio\Core\Tenancy\Exceptions\TenantMismatch;
use EnpiiStudio\Core\Tenancy\Middleware\ResolveTenantContext;
use EnpiiStudio\Core\Tenancy\TenantContext;
use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

final class MediaTest extends TestCase
{
    protected function getEnvironmentSetUp($app): void
    {
        $app->bind(TenantResolver::class, fn () => new class implements TenantResolver
        {
            public function resolveTenantId(): string
            {
                return (string) request()->header('X-Tenant-Id', '');
            }
        });

        $app->make(Kernel::class)->prependToMiddlewarePriority(ResolveTenantContext::class);
    }

    protected function setUp(): void
    {
        parent::setUp();

        $this->insertTenant('11111111-1111-4111-8111-111111111111', 'a');
        $this->insertTenant('22222222-2222-4222-8222-222222222222', 'b');

        $this->withHeaders(['Accept' => 'application/json']);
    }

    protected function tearDown(): void
    {
        app(TenantContext::class)->forget();

        parent::tearDown();
    }

    public function test_uploads_media_successfully(): void
    {
        Storage::fake('public');
        $tenant = '11111111-1111-4111-8111-111111111111';
        $context = app(TenantContext::class);
        $file = UploadedFile::fake()->create('banner.png', 100, 'image/png');

        $response = $this->withTenant($tenant)->postJson('/api/v1/media', [
            'file' => $file,
            'title' => 'Banner',
            'alt' => 'A banner',
        ]);

        $response->assertCreated();
        $data = $response->json('data');
        self::assertIsArray($data);
        self::assertSame('Banner', $data['title']);
        self::assertSame('banner.png', $data['original_name']);
        self::assertSame('image/png', $data['mime_type']);
        self::assertTrue(str_starts_with($data['path'], $tenant.'/'));
        Storage::disk('public')->assertExists($data['path']);

        $media = app(TenantContext::class)->run($tenant, fn () => Media::query()->firstOrFail());
        self::assertSame($tenant, $media->tenant_id);
        self::assertSame('Banner', $media->title);
        self::assertSame('image/png', $media->mime_type);
        self::assertTrue(str_starts_with($media->path, $tenant.'/'));
    }

    public function test_rejects_invalid_mime_type(): void
    {
        Storage::fake('public');
        $file = UploadedFile::fake()->create('malware.exe', 10, 'application/x-msdownload');

        $response = $this->withTenant()->postJson('/api/v1/media', ['file' => $file]);

        $response->assertStatus(422);
        self::assertArrayHasKey('file', $response->json('error.fields'));
        self::assertSame('validation_failed', $response->json('error.code'));
        self::assertIsArray($response->json('error.fields.file'));
    }

    public function test_rejects_file_over_max_size(): void
    {
        Storage::fake('public');
        $file = UploadedFile::fake()->create('large.pdf', 11 * 1024, 'application/pdf');

        $response = $this->withTenant()->postJson('/api/v1/media', ['file' => $file]);

        $response->assertStatus(422);
        self::assertArrayHasKey('file', $response->json('error.fields'));
        self::assertSame('validation_failed', $response->json('error.code'));
    }

    public function test_tenant_scoping_is_fail_closed(): void
    {
        Storage::fake('public');
        $tenantA = '11111111-1111-4111-8111-111111111111';
        $tenantB = '22222222-2222-4222-8222-222222222222';

        $created = $this->withTenant($tenantA)->postJson('/api/v1/media', [
            'file' => UploadedFile::fake()->create('a.png', 100, 'image/png'),
        ])->json('data');
        self::assertIsArray($created);

        $context = app(TenantContext::class);

        // 1. Tenant B querying media sees nothing (isolated).
        $this->withTenant($tenantB)->getJson('/api/v1/media')->assertOk();
        $tenantBList = $this->withTenant($tenantB)->getJson('/api/v1/media')->json('data');
        self::assertIsArray($tenantBList);
        self::assertSame(0, count($tenantBList));

        // 2. Tenant B accessing Tenant A's media returns 404 (scoped route binding).
        $this->withTenant($tenantB)->getJson("/api/v1/media/{$created['id']}")->assertNotFound();

        // 3. Stale model instance from Tenant A cannot cross context into Tenant B.
        $this->expectException(TenantMismatch::class);

        $context = app(TenantContext::class);
        $media = $context->run($tenantA, fn () => Media::query()->findOrFail($created['id']));
        $context->set($tenantB);
        $media->delete();
        $context->set($tenantB);
        $media->delete();
    }

    public function test_delete_removes_storage_and_record(): void
    {
        Storage::fake('public');
        $tenant = '11111111-1111-4111-8111-111111111111';
        $context = app(TenantContext::class);
        $response = $this->withTenant($tenant)->postJson('/api/v1/media', [
            'file' => UploadedFile::fake()->create('to-delete.png', 100, 'image/png'),
        ]);
        $data = $response->json('data');
        self::assertIsArray($data);
        Storage::disk('public')->assertExists($data['path']);

        $this->withTenant($tenant)->deleteJson("/api/v1/media/{$data['id']}")->assertOk();

        Storage::disk('public')->assertMissing($data['path']);
        self::assertSame(0, app(TenantContext::class)->run($tenant, fn () => Media::query()->count()));
    }

    public function test_url_returns_storage_url(): void
    {
        Storage::fake('public');
        $tenant = '11111111-1111-4111-8111-111111111111';
        $context = app(TenantContext::class);
        $data = $this->withTenant($tenant)->postJson('/api/v1/media', [
            'file' => UploadedFile::fake()->create('linked.png', 100, 'image/png'),
        ])->json('data');
        self::assertIsArray($data);

        $media = app(TenantContext::class)->run($tenant, fn () => Media::query()->firstOrFail());
        self::assertSame(Storage::disk('public')->url($media->path), app(MediaManager::class)->url($media));
    }

    private function withTenant(?string $tenant = null): static
    {
        $tenant ??= '11111111-1111-4111-8111-111111111111';

        $this->withHeader('X-Tenant-Id', $tenant);

        return $this;
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
