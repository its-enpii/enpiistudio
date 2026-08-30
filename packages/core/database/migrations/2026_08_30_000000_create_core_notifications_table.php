<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('core_notifications', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('notifiable_type');
            $table->uuid('notifiable_id');
            $table->string('type');
            $table->string('title');
            $table->text('body');
            $table->json('data')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            $table->index('read_at');
            $table->index(['tenant_id', 'notifiable_type', 'notifiable_id']);
            $table->foreign('tenant_id')->references('id')->on('core_tenants')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('core_notifications');
    }
};
