# Status Progress — Enpii Studio Platform Expansion

> 2026-09-01: Roadmap 7/7 SELESAI. Item7 vertical demo = encanteen (konfirmasi pemilik).

> File status kerja lintas-sesi. Setiap milestone WAJIB dicatat di sini (append-style per bagian).
> Update oleh: Hermes (orchestrator) + watchdog cron `enpii-platform-watchdog` (e41ab6e1e2b6).
> Konvensi kerja: `docs/platform-conventions.md` (prinsip: konsisten, jangan tampil beda).
> Arahan pemilik (2026-08-30): #6 vertical demo DITUNDA sampai brief dikirim.

## Ringkasan Roadmap (agreed 2026-08-30)

1. [x] Konvensi platform tertulis — `docs/platform-conventions.md` (push d0a2e8e, CI hijau)
2. [x] Module core **Media** - storage abstraction, tenant-scoped, /api/v1/media (merged 1637a84)
3. [x] Module core **Notification** - in-app center, mark-read (merged 890a601)
4. [x] Docs site **VitePress** - docs-site/ (merged f50487a)
5. [x] **Bridge** - OpenAPI per module + TS types generate + fetch wrapper (merged 41d4925)
6. [x] **App Skeleton** (layout presets + brand.css, anti "serupa" design)
7. [~] **Vertical demo** — encanteen **DIHAPUS oleh pemilik 2026-09-01** ("SAMPAH"): repo lokal + GitHub remote dihapus, task logs/screenshots dibersihkan, port 8097 ditutup. Item kembali terbuka; brief baru dari pemilik dulu sebelum diputuskan.

Urutan eksekusi aktif: 2+3 paralel → 4 → 5 → 6 → 7. Semua item selesai.

## Snapshot selesai sebelum file ini ada (2026-08-30)

- `@its-enpii/ui` v0.8.0 **published** ke GitHub Packages (tag ui-v0.8.0, workflow `Publish UI package` hijau)
- 82 komponen, i18n ID/EN, useForm/useField, useFormat (Intl), v-permission/v-tooltip, motion tokens
- Audit conformance: 82/82 × 5 style layer, 7 theme, weight cap OK
- Monorepo main @ d0a2e8e, semua CI workflow hijau
- ui-sandbox (~/projects/ui-sandbox, branch feat/demo-upgrade-v2): 3 agent Codex paralel (sbx-a routing+coverage 82 komponen, sbx-b theme/layer switcher via PostCSS wrap, sbx-c playground+pages util)

## Log Progress

### 2026-09-07 — UI batch 2 base-raw feedback/overlay/navigation/data-display SELESAI
- `@its-enpii/ui` tetap v1.3.1: 28 komponen feedback, overlay, navigasi, dan data-display kini base-raw tanpa keputusan warna. Ukuran, radius, press, shadow, dan opacity disabled tetap base; enam layer mengisi 50 hook batch 2 (`--tone-*`, `--overlay-*`, `--card-*`, `--nav-*`, `--skeleton-*`, `--progress-*`, `--table-*`, `--kanban-*`) light+dark. Marker variant tetap di DOM.
- Conformance permanen dipecah menjadi fixture `batch1` dan `batch2`: keduanya memeriksa component scope dan layer completeness tanpa selector. Layer wiring juga mengunci konsumsi hook utama per komponen batch 2. Charts, pickers, upload, editor, dan domain komponen tidak disentuh.
- Verifikasi: `check` 0 error; `test` 38 files/447 tests pass; `test:tailwind` 3 tests + smoke pass; `golden:check` 4 tests pass; `build` sukses; `audit-template-classes.mjs` exit 0. Golden baseline berubah pada 147 snapshot state/theme untuk penghapusan warna base saja.

### 2026-09-07 — UI batch 1 base-raw controls & fields SELESAI
- `@its-enpii/ui` tetap v1.3.1: 13 kontrol/field/label kini base-raw tanpa keputusan warna. Base menyediakan sizing, radius, state, disabled opacity, dan hook warna; enam layer mengisi 17 hook (`--control-primary/secondary/ghost/danger`, `--field`, `--label-fg`) light+dark. Marker variant tetap di DOM.
- Conformance permanen ditambahkan lewat `tests/color-free-base.conformance.spec.ts` + fixture hook/component scope; class collector diekspor ulang. Golden harness kini menyelesaikan hook batch ini sebagai transparent, sehingga baseline tanpa layer telanjang.
- Verifikasi: `check` bersih; `test` 388 passed/0 failed; `test:tailwind` 3 passed + smoke; `golden:check` 4 passed; `build` sukses; `audit-template-classes.mjs` exit 0; `git diff --check` + `contract:check` bersih. Golden baseline berubah pada 129 snapshot state/theme untuk penghapusan warna base saja.

### 2026-09-06 — UI structural layer wiring gap SELESAI
- packages/ui tetap v1.2.0: 24 komponen kontrol/surface/overlay kini membaca `--control-border-width` atau `--overlay-border-width`; token baru `--radius-control-sm: 4px` mempertahankan base Checkbox persis. Pressable lokal dinormalisasi ke token-driven transform/pressed shadow tanpa perubahan visual.
- Pengecualian sah terdokumentasi permanen di `packages/ui/tests/layer-wiring.conformance.spec.ts`: DesktopSplashScreen, Footer, LoanHistoryTable, Rating, Spinner.
- Verifikasi: `check` bersih; `test` 349 passed/0 failed; `test:tailwind` 3 passed + smoke; `golden:check` 4 passed dengan baseline 0 diff; `build` sukses.

### 2026-09-07 — UI audit marker manifest + 52 dead class fix SELESAI
- `@its-enpii/ui` tetap v1.3.0: audit template class kini memakai Tailwind v4 design-system checker dan manifest marker eksplisit (`material-symbols-outlined`, `peer`, `group`, `group/item`); 52 token dead class dikonversi ke utility Tailwind v4, termasuk font/stroke/forced-colors/readonly chain dan breakpoint `xs` (`30rem`).
- Verifikasi: `check` bersih; `test` 367 passed/0 failed; `test:tailwind` 3 passed + smoke; `golden:record`/`golden:check` 4 passed; `build` sukses; `audit-template-classes.mjs` exit 0. Golden baseline hanya mencatat normalisasi Tailwind: `rgba(0,0,0,0)` → `transparent` dan empty shadow → `0 0 #0000`; snapshot komponen tidak berubah.

### 2026-09-06 — UI comprehensive control & accessibility correction selesai
- packages/ui v1.1.1: Badge besar diturunkan ke font-weight 600; RadioGroup diselaraskan ke `h-control-sm`; Range/SegmentedControl/Switch field/root mengikuti kontrak full-width; NotificationDropdown item menjadi button-semantics dengan keyboard support; CommandPalette memberi state `aria-current`; fokus ring token ditambahkan pada aksi sekunder TimePicker, DateRange, SmartTable, CurrencyInput, ThemeMenu, Switch, RadioGroup, PollCard, dan NotificationDropdown; overlay Navbar/OfflineBanner memakai `z-dropdown`/`z-toast`; SignaturePad default ink memakai token; FormRow/InputMask memakai spacing token; golden baseline diperbarui untuk tinggi RadioGroup 40px.
- Audit regex: 0 `font-extrabold`/weight >600, 0 raw hex di template, 0 alias `z-index-*`, 0 arbitrary field-gap utility; static BEM marker dipertahankan pada 86 komponen.
- Verifikasi: `check`, `test` (311 passed), `test:tailwind` (3 passed + smoke), `golden:check` (4 passed, 0 diff), `build` sukses.

### 2026-09-06 — UI Tailwind batch 5d SELESAI
- Komponen BarChart, LineChart, DonutChart, Sparkline, Avatar, Progress, QrCode, dan ImageUpload ditulis ulang ke Tailwind utility dengan marker BEM statis tetap dipertahankan; selector BEM lama hanya untuk kedelapan komponen itu dihapus.
- Token baru: `--color-canvas-text` dan `--animate-progress-indeterminate` didefinisikan di `packages/ui/entry.tailwind.css`.
- Verifikasi: `npm run check` bersih; Tailwind build/dist rerun; `npm run test` 310 passed/0 failed; `npm run test:tailwind` 7 passed; `npm run golden:check` PASS 0 diff; `npm run build` + `node scripts/tailwind-smoke.mjs` hijau.

### 2026-08-31 — POS batch4 SELESAI & merged — frontend kasir lengkap
- task-pos-cashier (14cbb3f -> merge 8e63228): pos-theme.css (token override persis design 3: sky/sunflower/surface/ink, 0 hardcoded #000/#FFF), PosMenuGrid/PosCart/PosTableMap/PosPaymentSheet (semua composed di atas primitif @its-enpii/ui, dicek manual), useCart/usePosToast composable, Orders/Index layout kasir + gate buka shift (shifts/current), OrderController web props, bundle app 275KB (gzip 90KB).
- Verifikasi mandiri: 66 tests/265 assertions OK (worktree sempat 65 warnings - .env hilang di worktree, bukan bug kode), pint bersih, build sukses, spot-check: palet token sesuai design, 4 komponen pakai primitif package, shift gate terpasang.
- POS main final: 66 tests/265 assertions + pint + build. Worktree & branch dihapus.
- Sisa: E2E alur order->bayar (playwright) + laporan akhir vertical demo #6 + keputusan hosting/deploy dari user.

### 2026-09-05 — UI Tailwind batch 5c (advanced form & picker) selesai di worktree
- 8 komponen terakhir `@its-enpii/ui` direwrite ke Tailwind utility: PasswordInput, OtpInput, RadioGroup, Range, TagInput, TimePicker, DateRange, ColorPicker.
- Static BEM marker dipertahankan untuk selector/test; rule 8 komponen dihapus dari components.css.
- ColorPicker swatch dikonversi ke 8 token semantic baru (`--enpii-color-picker-swatch-*`, light+dark), tanpa hex literal di template.
- Verifikasi: `check`, `test` (310 passed), `test:tailwind` (7 passed + smoke), `golden:check` (0 diff), `build` sukses; dist/tailwind.css rebuild + rename.


### 2026-08-31 — POS batch4 (frontend kasir) diluncurkan
- task-pos-cashier (~/tasks/pos-g-work, feat/pos-cashier-frontend, reasoning high): pos-theme.css (override token persis design 2/3: primary sky #87CEEB, accent sunflower #F4B740, surface #F7F9FA, ink #14202B, shadow ringan 2px 2px 0 ink, hover translate), 4 komponen custom di atas primitif package (PosMenuGrid, PosCart, PosTableMap, PosPaymentSheet), Orders/Index layout kasir + gate buka shift, konsumsi API merged batch2/3 tanpa ubah backend.
- Setelah agent ini: E2E alur order->bayar + laporan akhir vertical demo #6.


### 2026-08-31 — POS batch3 + docs-site SELESAI & merged (verifikasi mandiri)
- KDS realtime (79e430a -> merge 1819fa9): Reverb setup, OrderCreated/OrderItemStatusUpdated ShouldBroadcast, channel privat tenant-scoped (route channels.php: Gate kitchen.view + user->tenant_id === tenantId, fail-closed), Board.vue kolom Baru/Diproses/Siap. Verifikasi: 59 tests/237 assertions OK + pint + build.
- Reporting + shift fix (c927f34 -> merge 7c3c02f): closing_cash_expected = opening_cash + SUM(cash completed payments shift tsb, tenant filter eksplisit di raw query - rules 1.3), ReportingService (salesSummary/topProducts from snapshot/busyHours/shiftRecap), /reports API (Gate reports.view), Reports/Index.vue. Verifikasi: 60 tests/245 assertions OK + pint + build.
- Docs-site VitePress (a7562d9 -> merge f50487a di monorepo): docs-site/ folder, 16 halaman ter-build, UI components list di-generate dari src/index.ts = 84 komponen (bukan 82 - angka lama stale, agent jujur menandai discrepancy), npm scripts docs:dev/build/preview di root. Build sukses tanpa dead link.
- Fix pasca-merge POS: laravel-echo + pusher-js belum ada di main checkout (agent install di worktree sendiri) -> npm install + commit 6f23acc. Final POS main: 66 tests/265 assertions OK + pint + build. Final monorepo: docs-site merged, push f50487a.
- Worktree/branch semua dihapus. Sisa roadmap POS: batch4 frontend POS lengkap (Menu Grid, Table Map, Payment Sheet, theme neobrutalism-ringan) + E2E.


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

### 2026-08-31 — Deploy POS live di VPS + bug E2E login ditemukan
- Deploy docker compose 6 service di deploy/ (nginx :8089, php8.4-fpm, mysql8, redis, queue, reverb). Tenant demo 'Demo Cafe' + owner owner@demo.pos. Migrasi + 14 permission seeded.
- Fix selama deploy: image php 8.4 (vendor butuh >=8.4.1), bake enpii-studio/core ke image (path-repo), predis + REDIS_CLIENT, laravel/reverb ternyata belum ter-install oleh agent KDS (baru config) → di-install.
- BUG AKTIF: login HTTP 500 TenantContextMissing — catch-22: Authenticate middleware lookup user by session id kena TenantScope SEBELUM ResolveTenantContext jalan (resolver butuh Auth::user() = model tenant-scoped = butuh context). Patch titik manual di-revert (90882ef reverted) — fix arsitektur didelegasikan ke Codex (task-pos-tenant, feat/fix-tenant-auth): session-carried tenant_id dipilih saat login (milik app, bukan request eksternal), resolver prioritas session → fallback Auth::user().
- Keputusan styling: project POS pakai Tailwind v4 CSS-first @theme bind --enpii-* (docs v4.3 diverifikasi); rework semua halaman incl. auth (Breeze stock ilang) — delegasi berikutnya.

### 2026-08-31 (2) — Tenant auth catch-22 FIXED + E2E order→bayar LULUS di VPS
- Delegasi Codex (pos-h, feat/fix-tenant-auth, 34c9af3): session-carried tenant_id di LoginRequest + resolver session-first. Verifikasi mandiri: 69t/281a + pint.
- Verifikasi live MENEMUKAN 2 lapisan bug tambahan (bukan cakupan Codex): (1) urutan middleware — ResolveTenantContext harus SEBELUM AuthenticatesRequests (kernel dump: tenant idx=10 > auth idx=6 → TenantContextMissing di /dashboard); fix app-level prependToPriorityList(AuthenticatesRequests, Tenant) — tenant idx=6 < auth 7. (2) hasRole() post-login di guest route tanpa tenant middleware → dibungkus TenantContext::run dari session tenant (pola sama dgn Auth::attempt). (3) OrderController: import Inertia hilang (Class App\Http\Controllers\Inertia not found). (4) API group: Sanctum stateful wrapper menjalankan AuthenticateSession di nested pipeline SEBELUM tenant middleware → diganti EncryptCookies+AddQueued+StartSession langsung di group (sortable), + SANCTUM_STATEFUL_DOMAINS env.
- HASIL LIVE (localhost:8089): LOGIN=302; /dashboard /orders /kitchen /reports /tables /menu = 200; /api/v1/shifts/current = 200.
- E2E order→bayar via API: open shift (opening 500k) → create table T01 → category Kopi → item Americano 25k → order dine_in T01 → add item qty2 (subtotal 50k) → pay cash 60k (kembalian 10k) → **status=paid, payment completed**. 
- Commits: 4c53683, a8244e3, 840ce35 (pos-resto main). Core TIDAK diubah (fail-closed tetap). pos-resto masih tanpa remote (push menyusul setelah remote dibuat).

### 2026-09-01 - Roadmap item 5 Bridge SELESAI (Codex task-enpiistudio-bridge, verified Hermes)
- contracts/core/{_shared,media,notification}.yaml (3 API redocly clean) + packages/bridge (@its-enpii/bridge): openapi-typescript generated types, native fetch wrapper (envelope unwrap, BridgeError 422/401/403/404 normalize, X-Tenant-Id + Accept-Language), tanpa axios.
- Verifikasi mandiri Hermes (bukan self-report): contract:check 3 API clean, bridge:generate OK, 3/3 bridge tests, tsc --noEmit clean, ui 250/250 tests, ui build OK.
- Merge 6ffb88c -> 41d4925, push main, worktree+branch cleaned. Roadmap berikutnya: item 6 App Skeleton.

### 2026-09-05 — F71-1 Tailwind v4 Foundation (paralel BEM)
- packages/ui: Tailwind v4.3.3 devDependencies, build `dist/tailwind.css` terpisah, tema sky first-class (`src/theme/sky/tokens.css`), config loader (`enpii.ui.config.js`), plugin Vite `enpiiUi()`, dan smoke browser Playwright.
- Kontrak paralel dijaga: 0 perubahan file `src/components/*.vue`, `src/styles/components.css`, atau `src/styles/tokens.css` BEM lama.
- Verifikasi F1: `npm run check` 0 error, `npm run test` 309/309 lama tetap hijau, `npm run build` sukses, `npm run test:tailwind` 7/7 + smoke `bg-primary=rgb(135, 206, 235)`, `npm run build:tailwind` menghasilkan `dist/tailwind.css` dengan `.bg-primary`.

### 2026-09-05 22:08 EDT — F71-2b Batch 5b Tailwind rewrite SELESAI
- packages/ui: 8 komponen navigasi/overlay (Navbar, Sidebar, Breadcrumb, PageHeader, Popover, DropdownMenu, Drawer, BottomSheet) direwrite ke Tailwind utility dengan marker BEM dipertahankan; rule BEM terkait dihapus dari components.css.
- Token tambahan: `--enpii-color-scrim` untuk overlay scrim dan `--z-index-dropdown` mapping; Sidebar collapsed width/transisi tetap berbasis token dan v-model tidak berubah.
- Verifikasi: check clean, 310/310 tests, test:tailwind 7/7 + smoke sky/radius/height hijau, golden parity 0 diff, build sukses.

### 2026-09-06 01:58 EDT — F71-2b Batch 5e Tailwind rewrite SELESAI
- packages/ui: sisa komponen specialized direwrite ke utility Tailwind dengan marker BEM statis dipertahankan; rule component BEM dihapus dari `components.css`. `useShape` kini memancarkan marker + utility Tailwind.
- Cakupan batch: AreaChart/TrendBarChart; Rating/SignaturePad/WhatsAppPreview; Timeline/Stepper/TreeView/TransferList; RichEditor/MentionInput/CommandPalette/KeyboardShortcutsModal; FormField/FormRow/FormActions/StatTile/InlineEmptyState/Footer/OfflineBanner; CsvImportExport/ReportPeriodFilter/LoanHistoryTable/NotificationDropdown; ThemeMenu/DesktopTitleBar/DesktopSplashScreen; Assistant Action/Artifact/Poll/Widget; FileUpload/Icon/Tabs/Calendar.
- Verifikasi: `check` clean; Tailwind build + dist rename sukses; `test` 310/310; `test:tailwind` 7/7 + smoke hijau; `golden:check` 4/4 dengan 0 diff; `build` sukses. Audit regex `components.css`: 51 utility-like helpers, 6 alignment contracts, 2 legacy static-class LoanHistoryTable markers; 0 component CSS BEM styling tersisa.
### 2026-09-07 — UI v1.2.1 sr-only consumer build fix
- Menambahkan `@utility enpii-sr-only` pada entry Tailwind sehingga hidden inputs/labels tetap tersembunyi di consumer build; versi `@its-enpii/ui` menjadi 1.2.1, conformance test dan changelog diperbarui. Semua check/test/golden/build hijau; `dist/tailwind.css` memuat utility.

### 2026-09-07 — UI v1.3.0 label contract & class conformance
- Menambahkan conformance permanen `defined-classes.conformance.spec.ts`: setiap token kelas template wajib resolve ke utility Tailwind, style BEM komponen, atau `@utility` yang dikirim ke consumer; pelanggaran redundan di KanbanBoard dan WhatsAppPreview diperbaiki.
- Menambahkan `EnpiiLabel` sebagai kontrak label (`for`, size, tone, required, hidden) dengan tipografi token-based dan memigrasikan label ad-hoc pada 21 komponen form/input terkait tanpa mengubah pasangan `for`/`id` maupun aksesibilitas.
- Verifikasi: `check` 0 error; `test` 37 files/364 tests pass; `test:tailwind` 3 tests + smoke pass; `golden:check` 4 tests pass 0 snapshot diff; `build` sukses.

### 2026-09-07 — UI v1.3.0 class ship audit selesai
- Menutup audit hole pada class conformance: token marker hanya boleh lolos bila merupakan pure marker; rule BEM di `components.css` kini dianggap risiko dead CSS. Fixture 121 token historis dikunci sebagai pure marker agar regkresi tidak berulang.
- Memigrasikan label/markdown helper ke `@utility`, memindahkan border structural/filled ke inline utilities, memindahkan global `prefers-reduced-motion` guard ke `entry.tailwind.css`, dan menghapus `src/styles/components.css` dari source/package import. 140 token mati dihapus; 121 token ber-style historis dipastikan sudah memiliki padanan aktif atau merupakan pure marker; snapshot golden tetap 0 diff.
- Verifikasi: `check` 0 error; `test` 37 files/365 tests pass; `test:tailwind` 3 tests + smoke pass; `golden:check` 4 tests pass 0 snapshot diff; `build` sukses.
