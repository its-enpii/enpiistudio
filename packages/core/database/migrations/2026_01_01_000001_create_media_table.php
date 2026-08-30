<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('disk');
            $table->string('path');
            $table->string('filename');
            $table->string('original_name');
            $table->string('mime_type');
            $table->unsignedBigInteger('size');
            $table->string('title')->nullable();
            $table->string('alt')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index('tenant_id');
            $table->unique(['disk', 'path']);
            $table->foreign('tenant_id')->references('id')->on('core_tenants')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media');
    }
};
