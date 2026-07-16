<?php

declare(strict_types=1);

namespace EnpiiStudio\WhatsAppClient\Commands;

use EnpiiStudio\WhatsAppClient\Contracts\WhatsAppGateway;
use EnpiiStudio\WhatsAppClient\Exceptions\GatewayException;
use Illuminate\Console\Command;
use Throwable;

final class GatewaySmokeCommand extends Command
{
    protected $signature = 'enpii:whatsapp-smoke {instance : Gateway instance identifier}';

    protected $description = 'Check WhatsApp Gateway connectivity and instance status without sending a message';

    public function handle(WhatsAppGateway $gateway): int
    {
        try {
            $status = $gateway->status((string) $this->argument('instance'));
        } catch (GatewayException $exception) {
            $this->error($exception->getMessage());

            return self::FAILURE;
        } catch (Throwable $exception) {
            $this->error('Unexpected WhatsApp Gateway failure: '.$exception->getMessage());

            return self::FAILURE;
        }

        $this->info("Gateway reachable. Instance [{$status->instanceId}] status: {$status->status->value}");

        return self::SUCCESS;
    }
}
