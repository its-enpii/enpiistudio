# Enpii Studio

Monorepo baseline Laravel 12 / PHP 8.3+ yang mendistribusikan paket
internal dan satu layanan jaringan bersama. Repositori ini
menggabungkan paket Composer in-process, satu library Vue
presentasional, satu layanan WhatsApp Gateway internal, satu
kontrak OpenAPI, dan Compose untuk kebutuhan lokal.

## Inventaris aktif

- [`packages/core`](packages/core) — paket Composer in-process.
  Tenancy fail-closed, Identity, Authorization kustom, Settings,
  Feature Flags, Audit append-only.
- [`packages/whatsapp-client`](packages/whatsapp-client) — paket
  Composer in-process. Kontrak `WhatsAppGateway`, DTO, enum status,
  exception, fake, HTTP adapter ke Gateway internal.
- [`packages/ui`](packages/ui) — library Vue 3 + TypeScript + Vite.
  Design tokens, `EnpiiButton`, dan `EnpiiBadge` presentasional.
- [`services/whatsapp-gateway`](services/whatsapp-gateway) —
  layanan Laravel tersendiri (network boundary). Otorisasi API
  principal, ACL instance, lifecycle, text send, idempotency
  persisten, error envelope aman, health/readiness, PostgreSQL,
  Redis.
- [`contracts/whatsapp-gateway/openapi.yaml`](contracts/whatsapp-gateway/openapi.yaml)
  — kontrak OpenAPI 3.1 untuk layanan Gateway.
- [`compose.yaml`](compose.yaml) — stack lokal: PostgreSQL 17,
  Redis 7, layanan Gateway.

## Batas aktif

- Paket Composer (`packages/core`, `packages/whatsapp-client`)
  berjalan in-process di aplikasi Laravel konsumen.
- `@enpii-studio/ui` dikonsumsi aplikasi Vue 3 di sisi frontend.
- `services/whatsapp-gateway` adalah satu-satunya dependency
  jaringan bersama. Evolution API tetap layanan eksternal di
  belakang Gateway.
- Aplikasi produk: **belum ada**. Produk-produk akan dibuat di
  repositori terpisah yang memakai paket-paket di sini sebagai
  path Composer.

## Cara membaca dokumentasi

- [`docs/implementation-reference.md`](docs/implementation-reference.md)
  — referensi kontrak aktif: API publik paket, struktur tabel,
  enum, DTO, command, dan daftar kemampuan **belum ada**.
- [`docs/setup.md`](docs/setup.md) — runbook operasional lokal.
- [`docs/enpiistudio.md`](docs/enpiistudio.md) — target
  arsitektur. Bukan deskripsi implementasi aktif.
- [`docs/enpii-studio-roadmap.md`](docs/enpii-studio-roadmap.md)
  — roadmap hidup; dapat tertinggal dari sumber.

## Verifikasi

```bash
composer install
composer check
composer install --working-dir=services/whatsapp-gateway
composer check --working-dir=services/whatsapp-gateway
npm install
npm run contract:check
npm run ui:check && npm run ui:test && npm run ui:build
docker compose config --quiet
```

Pipeline CI menjalankan perintah yang sama dengan tambahan audit
Composer dan npm, pemindaian Redocly untuk OpenAPI, dan layanan
PostgreSQL + Redis sebagai service container.
