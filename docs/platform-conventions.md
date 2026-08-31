# Konvensi API & Arsitektur — Enpii Studio Platform

> Dokumen kontrak internal untuk semua module/package baru di monorepo enpiistudio.
> Prinsip utama (arahan pemilik): **Konsisten dan jangan mencoba untuk tampil beda.**
> Ketika ragu, ikuti pola yang SUDAH ada di repo — bukan pola baru.

## 0. Prinsip Dasar

1. **Konsistensi > kebaruan.** Setiap module baru harus terlihat seperti "keluarga" dari module
   yang sudah ada. Buka `packages/core/src/Tenancy/` sebagai referensi emas sebelum menulis module
   apa pun (struktur folder, penamaan, pola test, pola konfigurasi).
2. **Kontrak dulu, implementasi belakangan.** Perubahan perilaku lintas package dimulai dari
   contract/spec, disinkronkan ke implementasi (pola yang sudah dipakai `contracts/whatsapp-gateway`).
3. **Backend agnostik frontend.** Core (Laravel) TIDAK pernah berasumsi konsumen memakai @its-enpii/ui.
   UI tidak pernah memanggil endpoint spesifik — ia menerima props/adapter dari app.
4. **Fail-closed untuk hal yang sensitif** (tenancy, permission, auth). Pola guard tidak dilonggarkan.

## 1. Struktur Module Core (Laravel)

Setiap module domain di `packages/core/src/<Nama>/`:

```
packages/core/src/<Nama>/
├── Models/              # Eloquent model (Uuid primary key, SoftDeletes bila relevan)
├── Policies/            # Authorization via spatie/laravel-permission (pola Authorization existing)
├── Http/
│   ├── Controllers/     # Controller API tipis — validasi via FormRequest
│   ├── Requests/        # FormRequest: authorize() memakai ability, messages via __() translatable
│   └── Resources/       # API Resource — SATU bentuk response (lihat §2)
├── Events/              # Event domain (opsional)
├── Listeners/           # (opsional)
├── Policies/            # (opsional bila tidak perlu)
├── Database/Migrations/ # Migration di core, tabel berprefix <module>_
└── Tests/               # PHPUnit: happy path + authorization + tenant scoping (WAJIB)
```

- Nama tabel: `<module>_<entitas>` (contoh: `media_files`, `notification_messages`).
- Semua tabel domain punya `tenant_id` (composite FK ke core_tenants) — ikuti pola Tenancy.
- Model memakai trait `BelongsToTenant` (dan `BelongsToBranch` setelah module branch jadi).
- Registration: `CoreServiceProvider` mendaftarkan module (migrations, routes, policies) —
  tidak ada service provider terpisah per module kecuali module butuh binding khusus.

## 2. Bentuk Response API (WAJIB seragam)

Semua endpoint JSON mengembalikan envelope:

```jsonc
// Sukses — single
{ "data": { ... }, "meta": { "tenant": "<slug>", "locale": "id" } }

// Sukses — list + pagination
{ "data": [ ... ], "meta": { "current_page": 1, "per_page": 25, "total": 100 }, "links": { "..." } }

// Error
{ "error": { "code": "validation_failed", "message": "..." , "fields": { "email": ["..."] } } }
```

- Error `code` = snake_case, stabil, terdokumentasi (machine-readable). `message` sudah translated.
- HTTP status mengikuti standar REST; tidak ada HTTP 200 dengan body error.
- Pagination = LengthAware default; cursor bila dataset besar (documentasikan per endpoint).

## 3. Validasi & Pesan

- Validasi di FormRequest; pesan error pakai key translation `validation.<module>.<field>.<rule>`
  (register di lang files core: `id/` dan `en/` — dua bahasa WAJIB, default id).
- Pesan TIDAK pernah hardcoded string di controller.

## 4. Naming & Style

- PHP: PSR-12 + Pint config root. Class nama baku; method camelCase; route name `module.entity.action`.
- Route prefix: `/api/v1/<module>` — versi di path, tidak di header.
- TS/Vue (packages/ui + app): ikuti aturan AGENTS.md — BEM + token `--enpii-*`, prefix Enpii,
  i18n `t()` untuk teks user-facing, weight cap, reduced-motion. **Tidak ada exception styling baru.**
- TypeScript strict; API client types di-generate dari spec (lihat §5), tidak diketik manual.

## 5. Kontrak Backend↔Frontend (Bridge)

- Spec OpenAPI per module: `contracts/core/<module>.yaml` (components reusable di `contracts/core/_shared.yaml`).
- `npm run contract:check` lint SEMUA spec core + whatsapp (redocly config diperluas).
- TS types di-generate: `npm run bridge:generate` → `packages/bridge/src/generated/` (openapi-typescript).
- Client fetcher tipis di `packages/bridge` (fetch wrapper: envelope unwrap, error normalize,
  tenant/locale header injection `X-Tenant-Id`, `Accept-Language`). TANPA axios dependency.

## 6. Skeleton & Identitas Visual

- Skeleton memilih layout preset saat install (admin-sidebar | minimal | blank); TIDAK memaksa satu layout.
- App identitas = file `resources/css/brand.css` yang menimpa token `--enpii-*` (primary, radius, font, spacing).
- Skeleton TIDAK mendefinisikan warna brand; hanya menyediakan brand.css kosong + komentar petunjuk.
- Aplikasi konsumen BOLEH memakai Tailwind CSS: `tailwind.config` WAJIB mengikat palette/spacing ke
  token `--enpii-*` yang sama (contoh: `primary: 'var(--enpii-primary)'`), sehingga utility classes
  (`bg-primary`, `sm:`/`md:`/`lg:`) selalu mengonsumsi sumber token package — bukan warna literal baru.
  Token design dan Tailwind bukan alternatif: package = sumber token, project = konsumsi via utility.
- Bila ada keraguan tampilan: default ke tampilan bawaan @its-enpii/ui (konsisten), bukan custom baru.

## 7. Testing & Verifikasi (sama seperti AGENTS.md §3/§5)

- PHPUnit per module: unit + feature (API via acting). Tenant scoping test WAJIB untuk tabel bertenant_id.
- `vendor/bin/pint --test` clean.
- UI: vitest + visual sandbox (ui-sandbox) untuk komponen baru.
- CI: semua workflow hijau sebelum merge; commit kecil dan spesifik.

## 8. Dokumentasi

- Setiap module: `docs/modules/<nama>.md` — tujuan, skema data, endpoint, izin (abilities), contoh request/response.
- CHANGELOG package terdampak diupdate oleh orchestrator saat rilis (bukan oleh agent per-branch).

---
Ditetapkan: 2026-08-30, sebelum ekspansi platform (media/notification/menu/bridge/skeleton).
Sumber arahan: pemilik — "Konsisten dan jangan mencoba untuk tampil beda."
