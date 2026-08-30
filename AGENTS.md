# AGENTS.md — Enpii Studio Monorepo

Panduan untuk AI agent (dan manusia) yang bekerja di repositori ini: apa yang perlu diketahui, apa yang boleh/ tidak boleh diubah, dan alur kerja saat melakukan update pada package mana pun — bukan hanya UI, tapi keseluruhan monorepo.

## 1. Peta Monorepo

| Path | Package | Jenis | Konsumsi |
|---|---|---|---|
| `packages/core` | `enpii-studio/core` | Library Laravel (in-process) | Di-require aplikasi produk Laravel |
| `packages/ui` | `@its-enpii/ui` | Library komponen Vue 3 (presentational) | Di-import frontend Vue |
| `packages/whatsapp-client` | `enpii-studio/whatsapp-client` | PHP client (in-process) | Aplikasi produk → WhatsApp Gateway |
| `services/whatsapp-gateway` | `enpii-studio/whatsapp-gateway` | Layanan Laravel (jaringan) | Deploy terpisah, boundary jaringan |
| `contracts/whatsapp-gateway/openapi.yaml` | OpenAPI spec | Kontrak API | Sumber kebenaran client & gateway |

Prinsip arsitektur: **core & whatsapp-client berjalan dalam proses aplikasi konsumen**; **hanya whatsapp-gateway yang menjadi dependensi jaringan**. Jangan mengubah asumsi ini.

## 2. Aturan Keras (jangan dilanggar)

1. **Production servers PULL/FETCH only** — tidak pernah `git push` dari server produksi. Hotfix dikerjakan lokal, lalu server pull.
2. **Kontrak API**: perubahan perilaku WhatsApp harus mulai dari `contracts/whatsapp-gateway/openapi.yaml`, lalu disinkronkan ke `whatsapp-client` dan `whatsapp-gateway`. Jalankan `npm run contract:check`.
3. **UI package**: Vue satu-satunya peer dependency. CSS murni BEM + token (`tokens.css`), tanpa Tailwind. Nama komponen pakai prefix `Enpii`. Style layer (`styles/material|glassmorphism|neumorphism|neobrutalism|minimalism.css`) hanya mengubah bahasa visual (warna/shadow/radius/border/weight/transisi) — **sizing & layout tetap milik base** `src/styles/components.css`. Font-weight maksimal: ≤500 (material/glass/neuro/minimalism), ≤600 (neobrutalism). Warna harus via token `--enpii-*`; pengecualian hitam/putih netral untuk light-source neobrutalism/neumorphism.
4. **Tenancy di core bersifat fail-closed** — jangan longgarkan guard tenancy tanpa diskusi eksplisit.
5. **Secrets tidak pernah masuk repo/chat.** Pola kanonik: `~/.config/hermes/secrets.env` + JSON credentials chmod 600.

## 3. Perintah Verifikasi per Package

### Root (npm workspaces)
```bash
npm run ui:check        # vue-tsc typecheck
npm run ui:test         # vitest
npm run ui:build        # vite build → dist/
npm run contract:check  # redocly lint openapi.yaml
```

### packages/ui
```bash
cd packages/ui && npm run check && npm run test && npm run build
```
Setelah mengubah style/componen: build ulang dist lalu verifikasi visual di sandbox demo (Playwright headless, baca computed style panel popup — lihat §5).

### packages/core, packages/whatsapp-client, services/whatsapp-gateway (PHP)
```bash
composer install
vendor/bin/phpunit   # sesuai phpunit.xml masing-masing
vendor/bin/pint      # code style (pint.json di root)
```

### services/whatsapp-gateway tambahan
```bash
docker compose up -d          # compose.yaml root
curl -f http://localhost:<port>/health || echo down
```

## 4. Alur Kerja Update Package

### 4a. Update dependensi (composer/npm)
1. Cek changelog/breaking changes upstream DULU sebelum bump.
2. Bump satu package/ekosistem per commit (PHP dan Node terpisah).
3. Jalankan seluruh verifikasi §3 yang relevan.
4. Commit pesan format: `chore(deps): bump <pkg> <versi-lama> → <versi-baru>`.

### 4b. Perubahan kode package
1. Ubah di package sumber (bukan di aplikasi konsumen).
2. Tambah/perbarui test yang membuktikan perubahan.
3. Jalankan verifikasi §3.
4. Jika mengubah konsumsi antar-package (mis. core → ui), perbarui juga docs/ terkait.

### 4c. Perubahan UI (komponen/style)
1. Komponen baru: `src/components/Enpii<Nama>.vue`, export di `src/index.ts`, test minimal (render + prop utama), styling di `components.css` (base dulu, baru pastikan kelima style layer menutupinya).
2. Style baru/tema: token-based, ikuti aturan §2.3, weight cap, focus ring dipertahankan, hormati `prefers-reduced-motion`.
3. Audit conformance style-layer (bila ada keraguan): delegasikan ke Claude Code / Codex CLI dengan checklist state coverage, dark-mode, specificity, kombinasi variant, eksistensi token di semua tema.
4. Versi package: bump `version` di `packages/ui/package.json` mengikuti semver (breaking = major, fitur = minor, fix = patch). Publish target: GitHub Packages (`publishConfig` sudah diatur).

### 4d. Perubahan kontrak WhatsApp
1. Edit `contracts/whatsapp-gateway/openapi.yaml`.
2. `npm run contract:check` sampai hijau.
3. Implementasi/sinkronkan `whatsapp-client` (konsumen) dan `services/whatsapp-gateway` (penyedia).
4. Test integration kedua sisi; gateway diuji lewat container.

## 5. Verifikasi End-to-End (wajib sebelum push)

- Semua check/test/build §3 hijau.
- Untuk UI: uji nyata di halaman demo (sandbox) — bukan cuma unit test. Contoh pola yang sudah terbukti: inject layer CSS ke halaman demo, klik date-picker/smart-select, baca computed style panel (backdrop-filter/border-radius/box-shadow) per layer via Playwright.
- CI GitHub Actions harus hijau setelah push. Jika merah, perbaiki sebelum lanjut — jangan tumpuk commit di atas CI merah.

## 6. Gaya Kerja Agent

- Delegasi pengodean besar/audit ke Claude Code atau Codex CLI diperbolehkan; Hermes melakukan orkestrasi + verifikasi independen (jangan percaya klaim "selesai" tanpa cek hasil nyata).
- Audit multi-agent: pass pertama breadth (coverage), pass kedua verify fresh-eyes, pass ketiga adversarial. Selalu tutup dengan duplicate-selector check dan weight grep untuk CSS.
- Jangan bertanya kalau scope sudah jelas — pilih default paling aman dan eksekusi (preferensi user: action > clarifikasi).
- Commit kecil dan spesifik; jangan campur file temporer agent (masukkan `.audit-tmp/` dsb. ke `.gitignore`).

## 7. Dokumentasi Terkait

- `docs/progress.md` — **STATUS PROGRESS platform expansion (WAJIB: baca sebelum mulai kerja; update setelah tiap milestone selesai)**
- `docs/platform-conventions.md` — **KONTRAK arsitektur & API platform (WAJIB baca sebelum module/package baru)** — prinsip: konsisten, jangan tampil beda
- `docs/setup.md` — setup & runbook baseline
- `docs/enpii-studio-roadmap.md` — roadmap
- `DESIGN.md` — spesifikasi desain/token UI
- `docs/implementation-reference.md` — referensi implementasi

---
Terakhir diperbarui: 2026-08-24, setelah rangkaian 5-pass audit conformance style-layer @its-enpii/ui (HEAD c0965e6).
