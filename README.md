# Enpii Studio

Enpii Studio adalah monorepo Laravel 12/PHP 8.3+ yang memuat fondasi internal untuk aplikasi produk. Repositori ini belum memuat aplikasi produk siap pakai.

## Batas sistem aktif

```text
Aplikasi produk Laravel
├── enpii-studio/core                 in-process
├── enpii-studio/whatsapp-client      in-process
├── @its-enpii/ui                  frontend Vue
└── HTTP
    └── Enpii WhatsApp Gateway        layanan jaringan internal
        └── Evolution API             layanan eksternal
```

Aplikasi produk tidak boleh memanggil Evolution API secara langsung. Gateway adalah satu-satunya batas jaringan bersama; Core dan WhatsApp Client tetap berjalan di dalam proses aplikasi konsumen.

## Mulai berdasarkan peran

| Peran | Mulai dari |
| --- | --- |
| Pengembang aplikasi produk | [Referensi implementasi aktif](docs/implementation-reference.md#6-contoh-integrasi-aplikasi-konsumen) untuk pemasangan Core, tenancy, authorization, WhatsApp Client, dan UI |
| Maintainer Enpii Studio | [Referensi kontrak lengkap](docs/implementation-reference.md) dan matriks kemampuan yang belum ada |
| Operator WhatsApp Gateway | [Setup dan runbook](docs/setup.md), lalu [kontrak API aktif](docs/implementation-reference.md#5-whatsapp-gateway) |

## Komponen aktif

| Komponen | Bentuk | Kemampuan aktif | Dokumentasi |
| --- | --- | --- | --- |
| [`packages/core`](packages/core) | Paket Composer in-process | Tenancy fail-closed, Identity, Authorization kustom, Settings, Feature Flags, Audit | [Core](docs/implementation-reference.md#2-core) |
| [`packages/whatsapp-client`](packages/whatsapp-client) | Paket Composer in-process | Kontrak, DTO, HTTP adapter, exception, fake, dan command untuk Gateway | [WhatsApp Client](docs/implementation-reference.md#3-whatsapp-client) |
| [`packages/ui`](packages/ui) | Paket npm internal | 43 komponen Vue BEM (`Enpii*`), plugin `enpiiUi`, composables, shape variants, 7 tema + dark mode | [UI](packages/ui/README.md) · [Theming](packages/ui/THEMING.md) |
| [`services/whatsapp-gateway`](services/whatsapp-gateway) | Layanan Laravel berjaringan | API principal, ACL instance, lifecycle, text send, idempotency, error aman, health/readiness | [WhatsApp Gateway](docs/implementation-reference.md#5-whatsapp-gateway) |
| [`contracts/whatsapp-gateway/openapi.yaml`](contracts/whatsapp-gateway/openapi.yaml) | OpenAPI 3.1 | Kontrak HTTP Gateway yang dimaksud | [Perbedaan implementasi/OpenAPI](docs/implementation-reference.md#59-perbedaan-implementasi-dan-openapi-yang-diketahui) |
| [`compose.yaml`](compose.yaml) | Stack lokal | PostgreSQL 17, Redis 7, dan WhatsApp Gateway | [Runbook Compose](docs/setup.md#gateway-melalui-compose) |

## Verifikasi cepat

Prasyarat dan prosedur lengkap tersedia di [`docs/setup.md`](docs/setup.md). Dari root repositori:

```bash
composer install
composer check
composer install --working-dir=services/whatsapp-gateway
composer check --working-dir=services/whatsapp-gateway
npm install
npm run contract:check
npm run ui:check
npm run ui:test
npm run ui:build
docker compose config --quiet
```

Perintah di atas tidak melakukan koneksi atau pengiriman WhatsApp live.

## Otoritas dokumentasi

1. [`docs/implementation-reference.md`](docs/implementation-reference.md) menjelaskan perilaku implementasi aktif.
2. [`docs/setup.md`](docs/setup.md) menjelaskan pemasangan dan operasi lokal.
3. [`contracts/whatsapp-gateway/openapi.yaml`](contracts/whatsapp-gateway/openapi.yaml) menjelaskan kontrak HTTP yang dimaksud. Perbedaan terhadap runtime dicatat di referensi implementasi.
4. [`docs/enpiistudio.md`](docs/enpiistudio.md) adalah arsitektur **Target**, bukan kontrak aktif.
5. [`docs/enpii-studio-roadmap.md`](docs/enpii-studio-roadmap.md) adalah roadmap non-normatif dan dapat tertinggal dari kode sumber.

## Batas utama saat ini

Aplikasi produk, resolver tenant konkret, propagasi tenant otomatis ke queue, pengiriman media, dan deployment produksi Gateway **belum ada**. Komponen UI interaktif kini tersedia di [`packages/ui`](packages/ui/README.md). Daftar lengkap beserta pengganti saat ini tersedia pada [matriks kemampuan yang belum ada](docs/implementation-reference.md#9-matriks-kemampuan-yang-belum-ada).
