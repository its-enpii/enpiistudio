<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gateway_api_principals', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('key_id')->unique();
            $table->string('key_hash');
            $table->string('status')->default('active');
            $table->timestamps();
        });

        Schema::create('gateway_instances', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->uuid('principal_id');
            $table->string('name')->unique();
            $table->text('provider_token')->nullable();
            $table->string('status')->default('disconnected');
            $table->timestamps();
            $table->unique(['id', 'principal_id']);
            $table->foreign('principal_id')->references('id')->on('gateway_api_principals')->restrictOnDelete();
        });

        Schema::create('gateway_idempotency_keys', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->uuid('principal_id');
            $table->string('operation');
            $table->string('key_hash', 64);
            $table->string('request_hash', 64);
            $table->string('status')->default('processing');
            $table->json('response')->nullable();
            $table->unsignedSmallInteger('http_status')->nullable();
            $table->timestamp('expires_at');
            $table->timestamps();
            $table->unique(['principal_id', 'operation', 'key_hash']);
            $table->foreign('principal_id')->references('id')->on('gateway_api_principals')->cascadeOnDelete();
        });

        Schema::create('gateway_message_deliveries', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->uuid('instance_id');
            $table->uuid('idempotency_id')->unique();
            $table->string('provider_message_id')->nullable();
            $table->string('recipient_hash', 64);
            $table->string('recipient_masked', 32);
            $table->string('status');
            $table->unsignedSmallInteger('attempts')->default(1);
            $table->timestamps();
            $table->foreign('instance_id')->references('id')->on('gateway_instances')->restrictOnDelete();
            $table->foreign('idempotency_id')->references('id')->on('gateway_idempotency_keys')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gateway_message_deliveries');
        Schema::dropIfExists('gateway_idempotency_keys');
        Schema::dropIfExists('gateway_instances');
        Schema::dropIfExists('gateway_api_principals');
    }
};
