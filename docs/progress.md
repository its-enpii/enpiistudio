# Status Progress — Enpii Studio Platform Expansion

> File status kerja lintas-sesi. Setiap milestone WAJIB dicatat di sini (append-style per bagian).
> Update oleh: Hermes (orchestrator) + watchdog cron `enpii-platform-watchdog` (e41ab6e1e2b6).
> Konvensi kerja: `docs/platform-conventions.md` (prinsip: konsisten, jangan tampil beda).
> Arahan pemilik (2026-08-30): #6 vertical demo DITUNDA sampai brief dikirim.

## Ringkasan Roadmap (agreed 2026-08-30)

1. [x] Konvensi platform tertulis — `docs/platform-conventions.md` (push d0a2e8e, CI hijau)
2. [ ] Module core **Media** (storage abstraction, tenant-scoped, /api/v1/media)
3. [ ] Module core **Notification** (in-app center, mark-read)
4. [ ] Docs site **VitePress** (`docs-site/`)
5. [ ] **Bridge** (OpenAPI per module + TS types generate + fetch wrapper)
6. [ ] **App Skeleton** (layout presets + brand.css, anti "serupa" design)
7. [ ] **Vertical demo** — MENUNGGU BRIEF dari pemilik; jangan dikerjakan tanpa brief

Urutan eksekusi aktif: 2+3 paralel → 4 → 5 → 6 → 7.

## Snapshot selesai sebelum file ini ada (2026-08-30)

- `@its-enpii/ui` v0.8.0 **published** ke GitHub Packages (tag ui-v0.8.0, workflow `Publish UI package` hijau)
- 82 komponen, i18n ID/EN, useForm/useField, useFormat (Intl), v-permission/v-tooltip, motion tokens
- Audit conformance: 82/82 × 5 style layer, 7 theme, weight cap OK
- Monorepo main @ d0a2e8e, semua CI workflow hijau
- ui-sandbox (~/projects/ui-sandbox, branch feat/demo-upgrade-v2): 3 agent Codex paralel (sbx-a routing+coverage 82 komponen, sbx-b theme/layer switcher via PostCSS wrap, sbx-c playground+pages util)

## Log Progress

### 2026-08-30 10:40 EDT — watchdog aktif
- Cron `enpii-platform-watchdog` (e41ab6e1e2b6) dibuat: tiap 20m, max 8 run.
- Tugas: pantau sbx-a/b/c → verifikasi sandbox (build + fix sendiri bila gagal) → eksekusi roadmap item 2+3 (2 agent Codex paralel, worktree, verifikasi phpunit+pint) → merge → push → CI hijau → item 4 (docs-site VitePress).
- Guard: tanpa brief #6 jangan kerjakan; tanpa bump versi ui; idempoten (cek apakah sudah selesai sebelum kerja).

<!-- TAMBAHKAN ENTRI BARU DI BAWAH, FORMAT: -->
<!-- ### YYYY-MM-DD HH:MM TZ — <judul>
- <status & bukti: commit sha, hasil verifikasi, link> -->
