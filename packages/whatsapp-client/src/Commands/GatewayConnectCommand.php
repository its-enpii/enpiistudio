<?php

declare(strict_types=1);

namespace EnpiiStudio\WhatsAppClient\Commands;

use EnpiiStudio\WhatsAppClient\Contracts\WhatsAppGateway;
use Illuminate\Console\Command;
use Throwable;

final class GatewayConnectCommand extends Command
{
    protected $signature = 'enpii:whatsapp-connect
        {instance : Gateway instance identifier}
        {--show-qr : Print the QR payload to the current secure terminal}
        {--show-pairing : Print the pairing code to the current secure terminal}';

    protected $description = 'Request an explicit WhatsApp instance connection through the internal Gateway';

    public function handle(WhatsAppGateway $gateway): int
    {
        $instance = (string) $this->argument('instance');

        try {
            $before = $gateway->status($instance);
            $this->info("Current instance status: {$before->status->value}");

            if ($before->isConnected()) {
                $this->info('Instance already open; connect was not requested.');

                return self::SUCCESS;
            }

            $connection = $gateway->connect($instance);
            $this->info("Connect requested. Instance status: {$connection->status->value}");

            if ($connection->qrCode !== null) {
                $this->line($this->option('show-qr') ? 'QR payload: '.$connection->qrCode : 'QR payload available; rerun with --show-qr in a secure terminal.');
            }

            if ($connection->pairingCode !== null) {
                $this->line($this->option('show-pairing') ? 'Pairing code: '.$connection->pairingCode : 'Pairing code available; rerun with --show-pairing in a secure terminal.');
            }

            $after = $gateway->status($instance);
            $this->info("Status after request: {$after->status->value}");

            if (! $after->isConnected()) {
                $this->warn('Scan/pair in WhatsApp, then run enpii:whatsapp-smoke. No polling or message send was performed.');
            }

            return self::SUCCESS;
        } catch (Throwable $exception) {
            $this->error('WhatsApp Gateway connection failure: '.$exception->getMessage());

            return self::FAILURE;
        }
    }
}
