# Setup dan Runbook Baseline

Baseline ini hanya monorepo package. Belum ada aplikasi produk. `packages/core` dan `packages/whatsapp-client` berjalan in-process di aplikasi Laravel konsumen; `packages/ui` dikonsumsi oleh frontend Vue aplikasi. Hanya Enpii WhatsApp Gateway merupakan dependency jaringan. Folder `enpii-studio-packages/` tetap referensi read-only.

## Prasyarat

- PHP 8.3 atau 8.4 beserta `mbstring`, `pdo_sqlite`, dan `pdo_pgsql` untuk aplikasi PostgreSQL.
- Composer 2.9.8 atau lebih baru.
- Node.js `^20.19.0` atau `>=22.12.0` beserta npm.
- Docker dengan Compose.

## Instalasi dan pemeriksaan

```bash
composer install
composer check
npm install
npm run ui:check
npm run ui:test
npm run ui:build
docker compose config --quiet
docker compose up -d
```

`composer check` menjalankan validasi manifest, Pint, dan PHPUnit. Test package menggunakan Orchestra Testbench serta SQLite in-memory. CI juga menyediakan PostgreSQL sebagai baseline service; migration tetap menggunakan schema Laravel portabel. Perintah `ui:*` menjalankan typecheck, Vitest, dan Vite library build.

## UI package

`packages/ui` adalah baseline setup, bukan component library spekulatif. Konsumsi dan mapping token Tailwind dijelaskan di `packages/ui/README.md`. Package hanya menyediakan tokens/foundations CSS, `EnpiiButton`, dan `EnpiiBadge` presentasional. Referensi read-only berasal dari Encore lokal; behavior Alpine/JavaScript tidak diambil. Modal, dropdown, tabs, toast, menu interaktif, dismissible chips, dan komponen stateful lain sengaja tidak disediakan. Tambah komponen setelah kebutuhan nyata berulang pada aplikasi produk.

## Memakai package pada aplikasi produk nanti

Tambahkan path repositories yang menunjuk ke `packages/core` dan `packages/whatsapp-client`, lalu require kedua package. Jangan copy source package ke aplikasi.

Core tidak otomatis menjalankan migration. Publish satu migration namespaced:

```bash
php artisan vendor:publish --tag=enpii-core-migrations
php artisan migrate
```

Nama tabel memakai prefix `core_`; filename migration vendor stabil membuat publish berulang idempotent dan menghindari collision. Jangan gunakan `--force` setelah aplikasi memiliki migration. Upgrade schema package harus berupa migration baru, bukan mengubah migration yang sudah pernah dijalankan.

## Tenancy

Model tenant-owned memakai `BelongsToTenant`. Query tanpa `TenantContext` melempar `TenantContextMissing`; ini disengaja agar gagal-tertutup. Aplikasi wajib membind `TenantResolver` miliknya lalu memasang middleware `ResolveTenantContext`; package tidak menyediakan resolver default. Job harus membawa tenant ID dan menjalankan pekerjaannya melalui `TenantContext::run($tenantId, fn () => ...)`. `run()` selalu membersihkan/memulihkan context. `tenant_id` bukan mass assignable; create mengisinya dari context; mismatch lifecycle ditolak.

Global scope tidak melindungi raw query, query builder, bulk insert, mass update/delete, atau native query methods seperti `increment`/`decrement`; model events juga dapat dilewati dengan `withoutEvents`/quiet methods. Operasi itu wajib menambahkan dan memvalidasi tenant secara eksplisit. Trait menolak `fresh()` dan `refresh()` ketika context sudah berubah. Audit append-only adalah behavior Eloquent, bukan database immutability: raw SQL dapat melewatinya. Gunakan hak DB least-privilege dan jangan memberi akses raw query pada input/user path. Tidak ada bypass platform-admin implisit.

## WhatsApp Gateway

Salin `.env.example` menjadi `.env` untuk Compose, lalu isi credential Gateway pada aplikasi konsumen:

```env
ENPII_WHATSAPP_GATEWAY_URL=https://gateway.example/api/v1
ENPII_WHATSAPP_GATEWAY_KEY=secret
```

Gateway internal berada di `services/whatsapp-gateway`. Install dan bootstrap lokal terpisah:

```bash
composer install --working-dir=services/whatsapp-gateway
cp services/whatsapp-gateway/.env.example services/whatsapp-gateway/.env
php services/whatsapp-gateway/artisan key:generate
php services/whatsapp-gateway/artisan migrate
php services/whatsapp-gateway/artisan gateway:principal-create local-product --instance=local-instance
php services/whatsapp-gateway/artisan serve --host=127.0.0.1 --port=8090
```

Simpan API key hasil provisioning sekali saja. Jangan masukkan key ke source, fixture, log, atau shell history bersama command lain. Credential Evolution hanya berada di environment Gateway atau kolom terenkripsi. Gunakan `EVOLUTION_API_DRIVER=http` untuk operasi normal. `EVOLUTION_API_DRIVER=fake` hanya untuk verifikasi lokal aman; mode ini tidak menghubungi atau mengirim melalui Evolution API. Media endpoint sengaja mengembalikan `FEATURE_UNAVAILABLE` sampai fetch SSRF-safe tersedia.

Lifecycle selalu eksplisit melalui internal Gateway:

1. Periksa `status(INSTANCE_ID)` atau jalankan smoke command.
2. Bila belum `connected`, operator meminta connect secara eksplisit.
3. User scan QR atau memasukkan pairing code pada WhatsApp.
4. Periksa status lagi sampai `connected`; package tidak polling tanpa batas.
5. Baru panggil `sendText()`.

```bash
php artisan enpii:whatsapp-smoke INSTANCE_ID
php artisan enpii:whatsapp-connect INSTANCE_ID
# Gunakan --show-qr atau --show-pairing hanya di terminal aman.
php artisan enpii:whatsapp-smoke INSTANCE_ID
```

Connect command melakukan tepat satu status check, satu connect request bila perlu, lalu satu status check. Command tidak mengirim pesan. Send methods tidak pernah auto-connect. QR/pairing payload disembunyikan secara default karena merupakan material provisioning sensitif.

Pengiriman mewajibkan idempotency key 8–200 karakter aman. Gateway mengotorisasi API principal terhadap instance, melakukan claim persisten per principal+operation+key, replay hasil stabil, serta menolak key yang dipakai ulang dengan payload berbeda. Package tetap memanggil internal Enpii WhatsApp Gateway; aplikasi produk dilarang memanggil Evolution API langsung.

Smoke infrastruktur 2026-07-15 mengonfirmasi Evolution API root aktif pada versi `v2.3.7`. Instance `Enpii` ditemukan, tetapi connection state masih `close`; karena itu E2E connect/send belum lolos dan tidak dijalankan. Jangan menjalankan connect atau send tanpa konfirmasi pengguna. Credential, token, API key, dan nomor tidak disimpan dalam repository atau output pemeriksaan.

Response global `fetchInstances` mengandung token instance. Jangan log response mentah. Log hanya field allowlist seperti nama instance dan connection state; redaksi minimal `token`, `api_key`, `apikey`, `authorization`, `secret`, `password`, serta nested variants sebelum logging/testing. Fake dan HTTP contract tests tidak memakai credential nyata.

## Operasional lokal

```bash
docker compose up -d
docker compose ps
docker compose logs postgres redis
docker compose down
docker compose down -v  # menghapus data lokal secara permanen
```

Default lokal: PostgreSQL `localhost:5432`, Redis `localhost:6379`, Gateway `localhost:8090`. Set `GATEWAY_APP_KEY` dari `php artisan key:generate --show` sebelum `docker compose up`; tanpa key, penyimpanan credential terenkripsi tidak dapat dipakai. Ganti password sebelum environment non-lokal. Compose bukan deployment produksi.
