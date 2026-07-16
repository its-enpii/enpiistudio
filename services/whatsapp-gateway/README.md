# Enpii WhatsApp Gateway

Internal Laravel 12 network service. It owns Evolution API credentials, instance ACL, canonical lifecycle mapping, safe errors, and persistent idempotency. Product applications use `packages/whatsapp-client`; they never call Evolution API directly.

Contract: [`../../contracts/whatsapp-gateway/openapi.yaml`](../../contracts/whatsapp-gateway/openapi.yaml).

## Scope

Included: API principal key hashes, instance ownership, lifecycle adapter, text send, idempotency persistence, masked delivery metadata, health/readiness.

Deferred: media fetching (returns `FEATURE_UNAVAILABLE` until SSRF-safe fetching exists), inbound webhooks/chat, templates, orchestration, dashboard, billing.

Evolution credentials belong in environment/encrypted storage and must never enter logs, API errors, fixtures, or source control. Real connect/send is manual-only.

## Local bootstrap

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan gateway:principal-create local-product --instance=local-instance
php artisan serve --host=127.0.0.1 --port=8090
```

The provisioning command prints one API key once. Store it in the consuming application's secret manager. API status vocabulary is canonical: `disconnected`, `connecting`, `connected`, `error`. Media remains disabled. Rotate any Evolution credential previously exposed outside the secret manager before using this service.
