<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('core_webhook_endpoints', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->nullable();
            $table->string('url');
            $table->string('secret');
            $table->json('events');
            $table->string('status')->default('active');
            $table->timestamps();
            $table->index('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('core_tenants')->restrictOnDelete();
        });

        Schema::create('core_webhook_deliveries', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->uuid('endpoint_id');
            $table->string('event');
            $table->json('payload');
            $table->string('status');
            $table->integer('response_status')->nullable();
            $table->text('response_body')->nullable();
            $table->integer('attempts')->default(0);
            $table->timestamps();
            $table->index('endpoint_id');
            $table->foreign('endpoint_id')->references('id')->on('core_webhook_endpoints')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('core_webhook_deliveries');
        Schema::dropIfExists('core_webhook_endpoints');
    }
};
