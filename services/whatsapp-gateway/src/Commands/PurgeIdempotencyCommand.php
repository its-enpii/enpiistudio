<?php

declare(strict_types=1);

namespace EnpiiStudio\WhatsAppGateway\Commands;

use Illuminate\Console\Command;
use Illuminate\Database\ConnectionInterface;

final class PurgeIdempotencyCommand extends Command
{
    protected $signature = 'gateway:idempotency-purge';

    protected $description = 'Delete expired Gateway idempotency records';

    public function handle(ConnectionInterface $database): int
    {
        $deleted = $database->table('gateway_idempotency_keys')
            ->where('expires_at', '<', now())
            ->delete();

        $this->info("Deleted {$deleted} expired idempotency records.");

        return self::SUCCESS;
    }
}
