<?php

declare(strict_types=1);

namespace EnpiiStudio\WhatsAppGateway\Commands;

use EnpiiStudio\WhatsAppGateway\Models\ApiPrincipal;
use EnpiiStudio\WhatsAppGateway\Models\GatewayInstance;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

final class CreatePrincipalCommand extends Command
{
    protected $signature = 'gateway:principal-create {name} {--instance=*}';

    protected $description = 'Create a Gateway API principal and print its key once';

    public function handle(): int
    {
        $keyId = Str::lower(Str::random(12));
        $secret = Str::random(48);
        $principal = ApiPrincipal::query()->create([
            'name' => $this->argument('name'),
            'key_id' => $keyId,
            'key_hash' => password_hash($secret, PASSWORD_DEFAULT),
            'status' => 'active',
        ]);

        foreach ($this->option('instance') as $instance) {
            GatewayInstance::query()->create([
                'principal_id' => $principal->getKey(),
                'name' => $instance,
                'status' => 'disconnected',
            ]);
        }

        $this->warn('Store this API key now. It will not be shown again.');
        $this->line($keyId.'.'.$secret);

        return self::SUCCESS;
    }
}
