<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('core_tenants', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('status')->default('active');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('core_users', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('name');
            $table->string('email');
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('status')->default('active');
            $table->rememberToken();
            $table->timestamps();
            $table->unique(['tenant_id', 'email']);
            $table->unique(['id', 'tenant_id']);
            $table->foreign('tenant_id')->references('id')->on('core_tenants')->restrictOnDelete();
        });

        Schema::create('core_roles', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('name');
            $table->string('slug');
            $table->timestamps();
            $table->unique(['tenant_id', 'slug']);
            $table->unique(['id', 'tenant_id']);
            $table->foreign('tenant_id')->references('id')->on('core_tenants')->restrictOnDelete();
        });

        Schema::create('core_permissions', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->timestamps();
        });

        Schema::create('core_permission_role', function (Blueprint $table): void {
            $table->uuid('permission_id');
            $table->uuid('role_id');
            $table->primary(['permission_id', 'role_id']);
            $table->foreign('permission_id')->references('id')->on('core_permissions')->cascadeOnDelete();
            $table->foreign('role_id')->references('id')->on('core_roles')->cascadeOnDelete();
        });

        Schema::create('core_role_user', function (Blueprint $table): void {
            $table->uuid('tenant_id');
            $table->uuid('role_id');
            $table->uuid('user_id');
            $table->primary(['tenant_id', 'role_id', 'user_id']);
            $table->foreign(['role_id', 'tenant_id'])->references(['id', 'tenant_id'])->on('core_roles')->cascadeOnDelete();
            $table->foreign(['user_id', 'tenant_id'])->references(['id', 'tenant_id'])->on('core_users')->cascadeOnDelete();
        });

        Schema::create('core_settings', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('key');
            $table->json('value')->nullable();
            $table->timestamps();
            $table->unique(['tenant_id', 'key']);
            $table->foreign('tenant_id')->references('id')->on('core_tenants')->restrictOnDelete();
        });

        Schema::create('core_feature_flags', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('key');
            $table->boolean('enabled')->default(false);
            $table->timestamps();
            $table->unique(['tenant_id', 'key']);
            $table->foreign('tenant_id')->references('id')->on('core_tenants')->restrictOnDelete();
        });

        Schema::create('core_audit_logs', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->uuid('actor_id')->nullable();
            $table->string('action');
            $table->string('subject_type');
            $table->string('subject_id');
            $table->json('before')->nullable();
            $table->json('after')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->index(['tenant_id', 'created_at']);
            $table->index(['tenant_id', 'subject_type', 'subject_id']);
            $table->foreign('tenant_id')->references('id')->on('core_tenants')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('core_audit_logs');
        Schema::dropIfExists('core_feature_flags');
        Schema::dropIfExists('core_settings');
        Schema::dropIfExists('core_role_user');
        Schema::dropIfExists('core_permission_role');
        Schema::dropIfExists('core_permissions');
        Schema::dropIfExists('core_roles');
        Schema::dropIfExists('core_users');
        Schema::dropIfExists('core_tenants');
    }
};
