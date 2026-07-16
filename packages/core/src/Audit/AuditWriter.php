<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\Audit;

use EnpiiStudio\Core\Audit\Contracts\AuditActorResolver;
use EnpiiStudio\Core\Audit\Models\AuditLog;
use EnpiiStudio\Core\Identity\Models\User;
use EnpiiStudio\Core\Tenancy\TenantContext;
use Illuminate\Contracts\Container\Container;
use Illuminate\Database\Eloquent\Model;
use InvalidArgumentException;

final readonly class AuditWriter
{
    private const SENSITIVE_KEYS = [
        'password',
        'password_confirmation',
        'remember_token',
        'token',
        'access_token',
        'refresh_token',
        'secret',
        'api_key',
        'apikey',
        'authorization',
    ];

    public function __construct(
        private TenantContext $context,
        private Container $container,
    ) {}

    public function record(string $action, Model $subject, array $before = [], array $after = [], array $metadata = []): AuditLog
    {
        $action = trim($action);

        if ($action === '') {
            throw new InvalidArgumentException('Audit action must not be empty.');
        }

        if (! $subject->exists || $subject->getKey() === null) {
            throw new InvalidArgumentException('Audit subject must be persisted.');
        }

        if (method_exists($subject, 'getTenantColumn')) {
            $this->context->assertMatches((string) $subject->getAttribute($subject->getTenantColumn()));
        }

        $actorId = $this->container->bound(AuditActorResolver::class)
            ? $this->container->make(AuditActorResolver::class)->actorId()
            : null;

        if ($actorId !== null && ! User::query()->whereKey($actorId)->exists()) {
            throw new InvalidArgumentException('Audit actor must belong to the current tenant.');
        }

        return AuditLog::query()->create([
            'tenant_id' => $this->context->id(),
            'actor_id' => $actorId,
            'action' => $action,
            'subject_type' => $subject->getMorphClass(),
            'subject_id' => (string) $subject->getKey(),
            'before' => $this->redact($before),
            'after' => $this->redact($after),
            'metadata' => $this->redact($metadata),
        ]);
    }

    private function redact(array $data): array
    {
        foreach ($data as $key => $value) {
            if (in_array(strtolower((string) $key), self::SENSITIVE_KEYS, true)) {
                $data[$key] = '[REDACTED]';
            } elseif (is_array($value)) {
                $data[$key] = $this->redact($value);
            }
        }

        return $data;
    }
}
