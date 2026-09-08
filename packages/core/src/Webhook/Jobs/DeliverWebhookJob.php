<?php

declare(strict_types=1);

namespace EnpiiStudio\Core\Webhook\Jobs;

use EnpiiStudio\Core\Webhook\Enums\WebhookDeliveryStatus;
use EnpiiStudio\Core\Webhook\Models\WebhookDelivery;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Throwable;

final class DeliverWebhookJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int $timeout = 30;

    public function __construct(
        public WebhookDelivery $delivery
    ) {}

    public function handle(): void
    {
        $delivery = $this->delivery->fresh(['endpoint']);

        if (! $delivery || ! $delivery->endpoint) {
            return;
        }

        $endpoint = $delivery->endpoint;
        $payload = $delivery->payload ?? [];
        $jsonPayload = json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        if ($jsonPayload === false) {
            $jsonPayload = json_encode($payload);
        }

        $signature = hash_hmac('sha256', (string) $jsonPayload, $endpoint->secret);

        $delivery->increment('attempts');

        try {
            $response = Http::timeout($this->timeout)
                ->withHeaders([
                    'X-Webhook-Signature' => $signature,
                    'X-Webhook-Event' => $delivery->event,
                    'X-Webhook-Delivery-Id' => (string) $delivery->id,
                    'Content-Type' => 'application/json',
                ])
                ->withBody((string) $jsonPayload, 'application/json')
                ->post($endpoint->url);

            $responseStatus = $response->status();
            $responseBody = $response->body();

            if ($response->successful()) {
                $delivery->update([
                    'status' => WebhookDeliveryStatus::Success,
                    'response_status' => $responseStatus,
                    'response_body' => $responseBody,
                ]);
            } else {
                $delivery->update([
                    'status' => WebhookDeliveryStatus::Failed,
                    'response_status' => $responseStatus,
                    'response_body' => $responseBody,
                ]);
            }
        } catch (Throwable $e) {
            $delivery->update([
                'status' => WebhookDeliveryStatus::Failed,
                'response_status' => null,
                'response_body' => $e->getMessage(),
            ]);
        }
    }
}
