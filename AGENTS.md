# AGENTS.md — Enpii Studio Monorepo

Panduan untuk AI agent dan manusia yang bekerja di repositori ini. Fokus aktif Enpii Studio adalah backend Laravel yang frontend-agnostic.

## 1. Peta Monorepo

| Path | Package | Jenis | Konsumsi |
|---|---|---|---|
| `packages/core` | `enpii-studio/core` | Library Laravel (in-process) | Di-require aplikasi produk Laravel |
| `packages/whatsapp-client` | `enpii-studio/whatsapp-client` | PHP client (in-process) | Aplikasi produk → WhatsApp Gateway |
| `services/whatsapp-gateway` | `enpii-studio/whatsapp-gateway` | Layanan Laravel (jaringan) | Deploy terpisah, boundary jaringan |
| `contracts/whatsapp-gateway/openapi.yaml` | OpenAPI spec | Kontrak API | Sumber kebenaran client & gateway |

Prinsip arsitektur: core dan whatsapp-client berjalan dalam proses aplikasi konsumen; hanya whatsapp-gateway yang menjadi dependensi jaringan bersama. UI identity, layout, komponen, dan styling milik tiap aplikasi produk.

## 2. Aturan Keras

1. **Production servers PULL/FETCH only** — tidak pernah `git push` dari server produksi. Hotfix dikerjakan lokal, lalu server pull.
2. **Kontrak API**: perubahan perilaku WhatsApp harus mulai dari `contracts/whatsapp-gateway/openapi.yaml`, lalu disinkronkan ke `whatsapp-client` dan `whatsapp-gateway`. Jalankan `npm run contract:check`.
3. **Backend agnostik frontend**: jangan menambahkan asumsi framework UI, component library, styling, atau identity visual ke Core, Client, Gateway, atau kontrak API.
4. **Tenancy di core bersifat fail-closed** — jangan longgarkan guard tenancy, permission, atau auth tanpa diskusi eksplisit.
5. **Secrets tidak pernah masuk repo/chat.** Pola kanonik: `~/.config/hermes/secrets.env` + JSON credentials chmod 600.

## 3. Perintah Verifikasi

### Root npm tooling

```bash
npm ci --ignore-scripts
npm run contract:check
npm run docs:build
npm audit --audit-level=high
```

### PHP packages dan service

```bash
composer validate --strict
vendor/bin/phpunit
vendor/bin/pint --test
```

Jalankan set PHP command pada root, `packages/core`, `packages/whatsapp-client`, atau `services/whatsapp-gateway` sesuai konteks perubahan. Gateway tambahan diuji lewat Compose dan health probe.

## 4. Alur Kerja

1. Ubah di package sumber, bukan di aplikasi konsumen.
2. Tambah atau perbarui test yang membuktikan perubahan.
3. Jalankan verifikasi relevan untuk package/layanan yang diubah.
4. Perubahan perilaku WhatsApp dimulai dari OpenAPI, lalu sinkronkan client dan gateway.
5. Update dokumentasi aktif; jangan ubah log historis di `docs/progress.md`, hanya tambahkan entri baru.

## 5. Verifikasi End-to-End

- Semua check/test/build relevan hijau sebelum merge.
- CI harus hijau setelah push. Jika merah, perbaiki sebelum commit/merge berikutnya.
- Untuk Gateway, jalankan Compose lalu verifikasi health/readiness sesuai runbook.

## 6. Dokumentasi Terkait

- `docs/progress.md` — status progres; baca sebelum mulai dan update setelah milestone selesai.
- `docs/platform-conventions.md` — kontrak arsitektur dan API.
- `docs/setup.md` — setup dan runbook.
- `docs/enpii-studio-roadmap.md` — roadmap.
- `docs/implementation-reference.md` — referensi implementasi aktif.

---
Terakhir diperbarui: 2026-09-07, setelah shared UI dan skeleton dihentikan.
