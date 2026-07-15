# Enpii Studio Packages

Monorepo baseline Laravel 12/PHP 8.3+:

- `packages/core`: Identity, tenancy fail-closed, authorization, settings, feature flags, audit behavior.
- `packages/whatsapp-client`: contract dan HTTP client in-process menuju Enpii WhatsApp Gateway.
- `packages/ui`: setup-only Vue 3/TypeScript/Vite library, tokens, Button, dan Badge presentasional.
- `compose.yaml`: PostgreSQL dan Redis lokal.

Belum ada aplikasi produk. Folder `enpii-studio-packages/` hanya referensi lama dan tidak menjadi source aktif.

Setup, migration ownership, tenancy rules, smoke command, dan runbook: [`docs/setup.md`](docs/setup.md).

```bash
composer install
composer check
npm install
npm run ui:check && npm run ui:test && npm run ui:build
docker compose config --quiet
```
