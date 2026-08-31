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

### 2026-08-31 — ui-sandbox merged+published; batch3 POS + docs-site diluncurkan (3 agent paralel)
- ui-sandbox: merge feat/demo-upgrade-v2 -> main (65b7b51, build sukses pre-merge). Repo TERNYATA belum punya remote -> buat github.com/its-enpii/ui-sandbox (private) + push main. Branch feature dihapus.
- Batch3 POS (2 agent, reasoning high): task-pos-kds (~/tasks/pos-e-work, feat/kds-realtime) — Reverb setup, OrderCreated/OrderItemStatusUpdated, channel privat tenant-scoped + Gate kitchen.view, Board.vue kolom Baru/Diproses/Siap; task-pos-reports (~/tasks/pos-f-work, feat/reporting) — FIX shift closing_cash_expected (opening + cash payments), ReportingService (salesSummary/topProducts/busyHours/shiftRecap, tenant-scoped), /reports API + Inertia page, refund accounting.
- Docs-site VitePress (1 agent): task-enpiistudio-docs (~/tasks/docs-site-work, feat/docs-site di monorepo) — docs-site/ folder, konten Core per-module + UI 82 komponen auto-gen dari index.ts, npm scripts docs:build/dev/preview.
- Pola konflik batch2 diconsole: prompt batch3 larangan eksplisit (bootstrap/app.php, Tenancy, logic payment) + arah "edit MINIMAL service yang ada / listener terpisah".


### 2026-08-31 — POS batch2 SELESAI + merge (tables/shift + orders/payments)
- Agent tables-shift (commit faaeafe): pos_tables + pos_shift_sessions, CRUD meja, open/close shift + cash_variance, AuditWriter manual, 6 test baru -> verifikasi mandiri 47 tests/193 assertions OK + pint. MERGED (dba7caf).
- Agent orders-payments (commit 7dde03d): 5 tabel transaksional + OrderService/PaymentService (lockForUpdate, split payment harus menutup grand_total, paid order immutable, snapshot harga, void+audit, sync status meja) -> test align + fix. Konflik routes/api.php keep-both; MenuModuleTest & OrdersPaymentsTest di-align ke migrasi nyata (drop shadow schema, opening_cash ditambah). Final 53 tests/217 assertions OK + pint + build. MERGED (ec9ba35 -> 116f556).
- Integration gap dicatat: ShiftController::close() menghitung closing_cash_expected = opening_cash saja - belum termasuk transaksi tunai selama shift. WAJIB diperbaiki di batch3 (setelah payments ada): expected = opening_cash + sum(pos_payments.cash_received) shift terkait.
- Worktree & branch feature dihapus. Batch3 next: KDS realtime (Reverb) || Reporting; perbaiki shift expected calculation.


### 2026-08-31 — POS batch1 SELESAI + merge (verifikasi mandiri)
- Agent foundation: 29 tests/97 assertions OK; menu: 37 tests/119 assertions OK; pint bersih keduanya. Spot-check rules: resolver hanya baca Auth::user()->tenant_id (throw TenantContextMissing), 5 model menu pakai BelongsToTenant, authorization via Gate 'enpii.permission' di FormRequest authorize() + MenuController.
- Merge ke main: konflik TestCase.php + routes/web.php + bootstrap/app.php + AppServiceProvider di-resolve keep-both; duplikat ProductTenantResolver (agent B buat ulang di App\Http\Resolvers) dihapus, keep varian app/Tenancy (final readonly + TenantContextMissing).
- BUG DITEMUKAN & FIXED post-merge: 6 test gagal TenantContextMissing saat implicit route-model binding — root cause: agent A OVERWRITE middleware priority (bukan prepend), sehingga SubstituteBindings keluar dari priority map; binding unlisted = tetap di posisi stack → jalan SEBELUM 'tenant' middleware. Fix: prependToPriorityList(SubstituteBindings, ResolveTenantContext). 41 tests/155 assertions OK + pint + build. Commit a1bb312.
- Dokumentasi brief dipindah ke ~/projects/pos-resto/docs/ (5 file, commit 4eb7377) sesuai instruksi user.
- Worktree pos-a/pos-b & branch feature dihapus. Lessons: agent wajib dilarang overwrite $middleware->priority (prepend saja); cek duplikasi class lintas-agent saat batch paralel.
- Batch2 next: Tables+Shift ∥ Orders+Payments.


### 2026-08-30 — VERTICAL DEMO DIMULAI: POS Resto/Cafe (brief user diterima)
- User kirim 5 dokumen brief: 01-architecture, 02-design, 03-prd, 04-rules, 05-schema (tersimpan di ~/tasks/pos/). Aplikasi standalone (BUKAN bagian monorepo) mengonsumsi core + ui.
- Scaffold `~/projects/pos-resto`: Laravel 12 + Breeze Inertia Vue, composer path-repo `enpii-studio/core` (@dev, symlink), npm file-dep `@its-enpii/ui`. Core migrations published + migrated (sqlite dev; target prod MySQL 8 per brief). Build sukses. Commit `b7b252a`.
- Delegasi batch 1 (2 agent Codex, reasoning high): `task-pos-foundation` (~/tasks/pos-a, branch feat/foundation-tenancy) — ProductTenantResolver, StaffProfile, onboarding tenant+owner, login gate nonaktif, role/permission/settings/flag seed; `task-pos-menu` (~/tasks/pos-b, branch feat/menu-module) — 5 tabel pos_menu_* + models + CRUD + Inertia pages + tests.
- Roadmap batch berikutnya: tables+shift → orders+payments → KDS realtime+reporting → frontend POS (menu grid/table map/KDS/payment sheet) + theme override neobrutalism-ringan.


### 2026-08-30 — Core modules Media + Notification MERGED & PUSHED (CI hijau)
- Agent `task-enpiistudio-core-media` (reasoning high): module Media — model+manager+API CRUD+validasi (mimes whitelist, max 10MB), storage per-tenant `{tenant_id}/yyyy/mm/uuid.ext`, config `enpii-core.php`, lang id/en, 12 test. Commit `1637a84` (16 files, +649). Efek samping: refactor `TenantScope` → resolve context via `app()` at apply-time (late binding, sesuai kontrak flush).
- Agent `task-enpiistudio-core-notif` (reasoning high): module Notification center — model tenant-scoped + morphTo notifiable, trait `HasNotifications` di User, `NotificationCenter` (send/markRead/markAllRead/unreadCount), API endpoints, lang id/en, 8 test. Commit `890a601`.
- Verifikasi mandiri per worktree: phpunit 43 & 45 OK, pint passed.
- Merge ke main: konflik TestCase.php + CoreServiceProvider.php (keep-both). **1 test gagal pasca-merge** (`NotificationTest::test_mark_all_read_endpoint` — TenantContextMissing): root cause = test memegang instance scoped pra-request padahal kontrak flush `03b2954` mengganti instance post-request; TenantScope baru (app() at apply-time) ekspos divergence. Fix test: re-resolve instance fresh post-request (commit `cd69fab`). **Bukan bug tenancy; kontrak flush dipertahankan (fail-closed).**
- Final: **51 tests / 137 assertions OK**, pint passed, push `e1c008c..cd69fab`, **CI success + Publish Composer success**.
- Worktree + branch dibersihkan. Roadmap berikutnya: docs site VitePress → Bridge → App Skeleton → (brief user utk #6).


### 2026-08-30 — ui-sandbox demo upgrade SELESAI (3 agent + 1 bugfix Hermes)
- Agent A (routing): multi-page hash router per kategori, 82 komponen ter-cover, 14 route — commit `6ae9e1a`
- Agent C (playground): DemoShowcase + PropsPlayground + halaman Motion/Formatting — commit `af28af2`
- Agent B (switcher): theme switcher 7 tema + layer switcher 5 skin (`enpii-toolbar.js`, PostCSS scope `[data-layer]`) — commit `e2908e3`
- **BUG ditemukan & diperbaiki Hermes**: postcss layer-scope plugin mendrop rules yang mengikuti top-level comment → block `:root` token tiap layer hilang di build (layer switch tampak tidak berubah). Fix: collect-then-append (commit `45a0e13`).
- Verifikasi mandiri: `npm run build` hijau; Playwright — 14 route render tanpa JS error, theme dracula applied, layer neobrutalism → radius 4px/border 2px/shadow keras rgb(17 17 17), glassmorphism → radius 16px/weight 500.
- Status: **sandbox CLEAR** (branch `feat/demo-upgrade-v2`, 5 commit). Berikutnya: batch Media + Notification modules (kontrak: docs/platform-conventions.md).


### 2026-08-30 10:40 EDT — watchdog aktif
- Cron `enpii-platform-watchdog` (e41ab6e1e2b6) dibuat: tiap 20m, max 8 run.
- Tugas: pantau sbx-a/b/c → verifikasi sandbox (build + fix sendiri bila gagal) → eksekusi roadmap item 2+3 (2 agent Codex paralel, worktree, verifikasi phpunit+pint) → merge → push → CI hijau → item 4 (docs-site VitePress).
- Guard: tanpa brief #6 jangan kerjakan; tanpa bump versi ui; idempoten (cek apakah sudah selesai sebelum kerja).

<!-- TAMBAHKAN ENTRI BARU DI BAWAH, FORMAT: -->
<!-- ### YYYY-MM-DD HH:MM TZ — <judul>
- <status & bukti: commit sha, hasil verifikasi, link> -->
