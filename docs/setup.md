# Setup dan runbook baseline

Repositori ini memuat paket reusable dan layanan WhatsApp Gateway internal. Aplikasi produk **belum ada**. Core dan WhatsApp Client berjalan di dalam proses aplikasi Laravel konsumen; UI dikonsumsi frontend Vue; hanya WhatsApp Gateway menjadi dependensi jaringan bersama.

## Prasyarat

- PHP 8.3 atau 8.4 dengan `mbstring`, `pdo_sqlite`, dan `pdo_pgsql`.
- Composer 2.9.8 atau lebih baru.
- Node.js `^20.19.0` atau `>=22.12.0` dengan npm.
- Docker dengan Compose untuk stack lokal Gateway.

## Validasi repositori

Jalankan dari root repositori. Gunakan `npm ci` pada checkout bersih; gunakan `npm install` saat sengaja mengubah dependensi.

```bash
composer install
composer check

composer install --working-dir=services/whatsapp-gateway
composer check --working-dir=services/whatsapp-gateway

npm ci
npm run contract:check
npm run ui:check
npm run ui:test
npm run ui:build
npm run ui:pack

docker compose config --quiet
```

Hasil yang diharapkan:

- Kedua `composer check` meloloskan validasi manifest, Pint, dan PHPUnit.
- `contract:check` meloloskan lint OpenAPI. Pemeriksaan ini belum membuktikan kesesuaian otomatis antara OpenAPI dan runtime.
- Pemeriksaan UI meloloskan typecheck, Vitest, build Vite, serta dry-run paket npm.
- `docker compose config --quiet` selesai tanpa keluaran atau error.

Pengujian perilaku paket Core memakai Orchestra Testbench dengan SQLite in-memory. Jangan menafsirkan hasil itu sebagai bukti eksekusi seluruh perilaku Core pada PostgreSQL.

## Memasang paket pada aplikasi produk

Aplikasi konsumen mengambil kedua paket dari repository distribusi publik berdasarkan tag rilis:

```bash
composer config repositories.enpii-studio-core vcs https://github.com/its-enpii/enpii-studio-core.git
composer config repositories.enpii-studio-whatsapp-client vcs https://github.com/its-enpii/enpii-studio-whatsapp-client.git
composer require enpii-studio/core:^0.1 enpii-studio/whatsapp-client:^0.1
```

Path repositories pada root monorepo hanya untuk pengembangan paket secara lokal. Jangan memakai checkout `../enpii-studio`, path repository, atau submodule dalam aplikasi konsumen. Versi paket mengikuti tag immutable pada repository distribusi; package belum didaftarkan ke Packagist sehingga kedua deklarasi VCS tetap wajib.

Penyedia layanan kedua paket terdaftar melalui Laravel package discovery. Core tidak memuat migrasinya secara otomatis. Periksa destination sebelum memublikasikan migrasi:

```bash
php artisan vendor:publish --tag=enpii-core-migrations
php artisan migrate
```

Migrasi Core memakai prefix tabel `core_`. File migrasi yang pernah dijalankan tidak boleh diubah untuk upgrade; tambahkan migrasi baru. Hindari `--force` pada publikasi karena dapat menimpa file tujuan.

Konfigurasi integrasi lengkap—model auth, `TenantResolver`, middleware, queue, authorization, dan audit actor—tersedia di [referensi Core](implementation-reference.md#2-core).

## Batas keamanan tenancy

Model milik tenant memakai `BelongsToTenant`. Query Eloquent scoped tanpa `TenantContext` melempar `TenantContextMissing`; perilaku ini sengaja fail-closed.

Aplikasi konsumen wajib:

1. Mengimplementasikan dan mengikat `TenantResolver`.
2. Memasang `ResolveTenantContext` pada route tenant.
3. Membawa ID tenant dalam payload queue dan menjalankan pekerjaan melalui `TenantContext::run()`.
4. Menambahkan filter tenant eksplisit pada raw query dan operasi bulk.

Global scope melindungi query Eloquent biasa. Ia tidak membuat raw query, bulk insert/update/delete, `increment`, `decrement`, quiet methods, atau `withoutEvents` aman secara otomatis. `withoutGlobalScopes()` menghapus filter SQL; hydration model masih dapat ditolak oleh event `retrieved`, tetapi bulk mutation tidak menjalankan lifecycle assertions.

Append-only audit juga hanya ditegakkan oleh event model Eloquent. Builder bulk, event suppression, dan raw SQL dapat melewatinya. Gunakan transaksi untuk perubahan domain beserta audit, hak database least-privilege, dan jangan membuka raw query pada jalur input pengguna.

## Konfigurasi WhatsApp Client

Aplikasi konsumen memakai variabel berikut:

```env
ENPII_WHATSAPP_GATEWAY_URL=https://gateway.example.internal/api/v1
ENPII_WHATSAPP_GATEWAY_KEY=key_id.secret
ENPII_WHATSAPP_GATEWAY_TIMEOUT=10
ENPII_WHATSAPP_GATEWAY_CONNECT_TIMEOUT=3
```

URL wajib HTTPS. Hanya host loopback tepat `localhost`, `127.0.0.1`, atau `::1` yang boleh memakai HTTP. Credential tidak boleh masuk ke kode sumber, fixture, log, atau dokumentasi.

Lifecycle selalu eksplisit:

```bash
php artisan enpii:whatsapp-smoke INSTANCE_ID
php artisan enpii:whatsapp-connect INSTANCE_ID
# Gunakan --show-qr atau --show-pairing hanya di terminal aman.
php artisan enpii:whatsapp-smoke INSTANCE_ID
```

Connect command menjalankan satu status check, satu connect request bila diperlukan, lalu satu status check. Command tidak mengirim pesan dan tidak melakukan polling tanpa batas. Send tidak pernah auto-connect.

## Gateway standalone

Gunakan `services/whatsapp-gateway/.env.example` sebagai dasar konfigurasi runtime standalone. Default database-nya `enpii_gateway`, berbeda dari default Compose `enpii`.

```bash
composer install --working-dir=services/whatsapp-gateway
cp services/whatsapp-gateway/.env.example services/whatsapp-gateway/.env
php services/whatsapp-gateway/artisan key:generate
php services/whatsapp-gateway/artisan migrate
php services/whatsapp-gateway/artisan gateway:principal-create local-product --instance=local-instance
php services/whatsapp-gateway/artisan serve --host=127.0.0.1 --port=8090
```

Perintah `gateway:principal-create` menampilkan API key satu kali. Simpan di secret manager. Jangan meletakkannya bersama perintah lain dalam shell history.

Untuk verifikasi lokal aman, set:

```env
EVOLUTION_API_DRIVER=fake
```

Fake driver tidak menghubungi Evolution API. Gunakan `EVOLUTION_API_DRIVER=http` hanya dengan credential yang sah dan persetujuan eksplisit untuk operasi connect/send live.

Scheduler aplikasi harus berjalan agar command `gateway:idempotency-purge` dijalankan setiap hari. Runtime standalone dan Compose saat ini tidak memulai scheduler otomatis.

## Gateway melalui Compose

Root `.env.example` menyediakan database, port, dan konfigurasi WhatsApp Client. Compose juga membaca variabel tambahan berikut; tambahkan ke root `.env` sebelum startup:

```env
GATEWAY_APP_KEY=base64:GENERATED_LOCAL_KEY
GATEWAY_PORT=8090
EVOLUTION_API_DRIVER=fake
EVOLUTION_API_URL=https://evolution.invalid
EVOLUTION_API_KEY=
```

Buat key lokal tanpa menyimpannya ke repository:

```bash
php services/whatsapp-gateway/artisan key:generate --show
```

`GATEWAY_APP_KEY` harus stabil. Mengubahnya dapat membuat `provider_token` terenkripsi tidak dapat dibaca dan mengubah keyed recipient hash.

Compose tidak meneruskan `EVOLUTION_API_TIMEOUT` atau `GATEWAY_RATE_LIMIT`; layanan memakai default 10 detik dan 60 permintaan terlindungi per menit. Stack lokal dijalankan dengan:

```bash
docker compose up -d
docker compose ps
```

Hasil yang diharapkan: `postgres`, `redis`, dan `whatsapp-gateway` sehat. Container Gateway menjalankan migrasi lalu Laravel Artisan development server. Stack ini bukan deployment produksi: tidak ada TLS termination, reverse proxy, scheduler, queue worker, atau process manager produksi.

Probe:

```bash
curl http://127.0.0.1:8090/api/v1/health
curl http://127.0.0.1:8090/api/v1/ready
```

`/health` hanya membuktikan proses merespons. `/ready` memeriksa database serta cache read/write, tetapi tidak memeriksa Evolution API. Compose healthcheck memakai `/health`, bukan `/ready`.

## Penghentian dan penghapusan data

```bash
docker compose down
```

Perintah berikut menghapus volume PostgreSQL dan Redis lokal secara permanen:

```bash
docker compose down -v
```

Periksa nama project Compose sebelum menjalankan `down -v`. Jangan hapus volume yang bukan dibuat untuk verifikasi ini.

## Aturan operasi WhatsApp

- Aplikasi produk dilarang memanggil Evolution API langsung.
- Connect/send nyata tidak boleh dijalankan otomatis atau tanpa persetujuan eksplisit.
- Gunakan business-derived idempotency key yang stabil. Setelah transport failure ambigu, ulangi dengan key yang sama—jangan membuat key baru.
- QR code dan pairing code adalah material provisioning sensitif. Jangan log atau simpan tanpa kebutuhan operasional yang sah.
- Respons mentah `fetchInstances` dapat memuat token instance. Jangan log respons tersebut; gunakan allowlist field yang aman.
- Media endpoint tetap mengembalikan `501 FEATURE_UNAVAILABLE` sampai pengambilan media SSRF-safe tersedia.

Kontrak lengkap autentikasi, ACL, idempotency, error, retry, readiness, dan perbedaan OpenAPI tersedia di [referensi WhatsApp Gateway](implementation-reference.md#5-whatsapp-gateway).
