## [1.2.1] - 2026-09-07

### Fixed
- Definisikan utility `enpii-sr-only` pada entry Tailwind agar input native dan
  label yang disembunyikan tetap tersembunyi pada consumer build yang hanya
  meng-import `tailwind.css` dan style layer.

## [1.2.0] - 2026-09-06

### Added
- Token struktural di fondasi: `--control-border-width`, `--overlay-border-width`,
  `--press-transform`, `--shadow-control-pressed` — komponen membaca token,
  bukan nilai hardcode.
- Kontrak struktural menyeluruh: card-border dan focus width/offset tokens,
  emit radius TW scale + track/media, dan wiring fokus pada 43 file.
- Style layer **value-set murni** (0 selector BEM, 0 `!important`): minimalism,
  material, glassmorphism, neumorphism, neobrutalism, **neobrutalism-tamed**
  (radius base 9px, easing halus, hard shadow 2px — bentuk POS dijinakkan).
- Test conformance `layer-wiring.conformance.spec.ts`: komponen ber-border
  wajib membaca token struktural; pengecualian terdokumentasi dengan alasan.

### Fixed
- Wiring token struktural pada 62/86 komponen (39 → 62): kontrol, surface,
  dan overlay kini konsisten merespons value-set layer mana pun.

## [1.1.1] - 2026-09-06

### Fixed
- Audit menyeluruh 86 komponen (posisi, display, padding, margin, font size/weight,
  tinggi/lebar, warna, state, aksesibilitas):
  - `EnpiiBadge`: font-weight besar (800) diturunkan ke 600 (hard cap ≤ 600).
  - `EnpiiRadioGroup`: tinggi opsi diselaraskan ke kontrak `control-sm`,
    focus-visible ring & state disabled diperkuat.
  - `EnpiiRange`, `EnpiiSegmentedControl`, `EnpiiSwitch`, `EnpiiDateRange`,
    `EnpiiTimePicker`: kontrak full-width & sizing control dirapikan.
  - `EnpiiNotificationDropdown`: item memakai semantics `button`, keyboard
    Enter/Space, focus ring, dan touch target memadai.
  - `EnpiiCommandPalette`: state aktif memakai `aria-current` + background semantic.
  - Focus ring semantic ditambahkan pada TimePicker, SmartTable, CurrencyInput,
    ThemeMenu, PollCard, Switch, dan aksi pendukung.
  - `EnpiiNavbar`, `EnpiiOfflineBanner`, `EnpiiDrawer`: z-index dinormalisasi ke
    token overlay (`z-*`), tanpa nilai mentah.
  - `EnpiiSignaturePad`: default ink memakai token; `EnpiiFormRow`,
    `EnpiiInputMask`: spacing via token.
- Golden baseline diperbarui (RadioGroup 40px) — parity tetap 0 diff.

## [1.1.0] - 2026-09-06

### Changed (BREAKING)
- `--enpii-*` dihapus sepenuhnya; seluruh token kini Tailwind-native `@theme`
  (`--color-*`, `--radius-*`, `--shadow-*`, `--z-index-*`, `--transition-duration-*`,
  `--ease-*`, `--spacing-control*`).
- `--shadow-card` bernilai `0 4px 10px rgb(15 23 42 / 0.12)` agar konsisten dengan value-set.
- Utility `z-index-*` diganti `z-*`; `h-control` dan `min-h-control` aktif via token Tailwind.
- Focus ring memakai `--shadow-focus`; value-set layer memakai namespace Tailwind yang sama.
- Export deprecated dihapus: `./config`, `./config/node`, `./vite`, `./tailwind.preset`,
  `./tailwind.v4.css`, dan `./theme/sky/tokens.css`.

### Fixed
- Style layer neobrutalism: perluasan coverage komponen yang sebelumnya lolos
  (Kanban board/kolom/kartu, Tabs, BottomSheet, CommandPalette, TimePicker,
  Stepper, StatTile, Spinner, PasswordInput, OtpInput, InputMask, TagInput,
  MentionInput, DatePicker control/footer/nav/selected, ikon kanban menu,
  judul modal/drawer/label form → ink 600). Invarian dijaga: 0 hex literal,
  font-weight ≤ 600, hanya token `--color-ink` + token native.

## [0.10.0] - 2026-09-05

### Changed (BREAKING di 0.x)
- **Field width contract**: semua field component (`EnpiiInput`, `EnpiiTextarea`, `EnpiiCurrencyInput`, `EnpiiSmartSelect`, `EnpiiDatePicker`, `EnpiiInputMask`, `EnpiiTagInput`) kini **full-width secara default** di root-nya. Konsumen tidak lagi perlu menambah class width manual (mis. `w-full`) agar field memenuhi panelnya. Untuk pemakaian inline/shrink, gunakan utilitas `.enpii-fit-content` atau bungkus dengan container sendiri.
- **`EnpiiSegmentedControl` default block**: default kini `width:100%` dengan option `flex:1` (proporsional). Pemakaian shrink/inline memakai modifier baru `inline`. Prop `block` tetap ada (no-op, backward compatible).

### Fixed
- **Control height contract**: `.enpii-input-mask__control` dan `.enpii-tag-input__control` kini memakai `var(--enpii-control-height)` (bukan hard-code `2.5rem`), sehingga semua field control yang sebaris (Input, SmartSelect, DatePicker, CurrencyInput, InputMask, TagInput, SegmentedControl, Button) memiliki tinggi seragam `3rem` (sm: `2.5rem` via modifier). Test kontrak baru: `control-height.test.ts` (assert tinggi identik dalam satu row) dan `alignment-conformance.test.ts` (kontrak lebar).

## [0.9.0] - 2026-09-03
- **Dep skeleton**: range `@its-enpii/ui` `^0.8.0` tidak mencakup 0.9.0 (semver 0.x: caret = patch-scope) → `^0.9.0` + root lockfile diregenerasi; `npm ci` bersih kembali.

### Added
- **Tailwind compatibility artifacts (opt-in)**: `tailwind.preset.js` untuk Tailwind 3 dan
  `tailwind.v4.css` untuk Tailwind 4; keduanya memetakan utility ke token `--enpii-*` yang ada
  tanpa menambahkan warna/nilai baru atau dependensi Tailwind ke package.
- **Hardening preflight Tailwind 3**: deklarasi font/line-height/color eksplisit pada
  `EnpiiInput`, `EnpiiBadge`, `EnpiiCard`, dan konten paragraf Card agar komponen tetap konsisten
  saat preflight aktif.
  Audit empiris Playwright membandingkan kondisi tanpa Tailwind vs preflight + utilities.
- **Panduan consumer**: `docs/tailwind-compat.md` mencakup urutan import, preflight, dark mode
  `data-theme="dark"`, dan contoh mapping utility ke token.
- **Exports & packaging**: `./tailwind.preset` dan `./tailwind.v4.css` kini tersedia via exports
  map dan ikut ke `dist/`.

## [0.8.2] - 2026-09-03

### Fixed
- **Ikon meluber dari kotaknya**: default `.material-symbols-outlined` di `icon-font.css` (font-size 24px, line-height 1) di-import terakhir dan menimpa semua rule ukuran ikon per-komponen yang sama-specificity (0,1,0) — ikon dengan box < 24px (currency action ±, smart-select chevron, date-picker icon/chevron, icon-button sm/md, input icon, switch, accordion, tabs) digambar dengan metrik 24px sehingga glyph bergeser ke kanan-bawah dari kotak pembungkusnya. Default kini dibungkus `:where()` (0,0,0); rule per-komponen menang; icon "telanjang" tetap 24px. Diverifikasi live via ink-bounds @3× di aplikasi consumer: offset ikon turun dari (+8,+10) ke (0,0..1) device-px.

## [0.8.1] - 2026-09-03

### Fixed
- **Dark-mode token specificity**: blok `@media (prefers-color-scheme: dark)` di `tokens.css` & `glassmorphism.css` memakai selector `:root:not([data-theme='light'])` (specificity 0,2,0) yang selalu mengalahkan override token consumer via `:root` (0,1,0) — melanggar kontrak override-via-token. Kini dibungkus `:where()` (0,0,0); perilaku matching identik (auto-dark + escape `data-theme='light'`). Diverifikasi live di aplikasi consumer: computed `box-shadow`/`surface` dark kini mengikuti override consumer di kedua tema.

## [0.8.0] - 2026-08-30

### Added
- **Publish infra**: GitHub Actions workflow `ui-publish.yml` (tag `ui-v*` -> GitHub Packages) + release guide `docs/ui-release.md`.
- **Intl format helpers**: `useFormat` — `formatCurrency` (default IDR), `formatNumber`, `formatPercent`, `formatDate` (short/medium/long/relative), locale-aware via i18n plugin.
- **Form validation layer**: dependency-free `useForm` / `useField` composables + rules (required, email, minLength, maxLength, min, max, pattern, sameAs, custom) dengan pesan error via `t()` (ID/EN); komponen baru `EnpiiFormField` (label + hint + error, aria-describedby).
- **Directives**: `v-permission` (`.any`/`.all`/`.hide`) & `v-tooltip` (posisi fixed + flip, ARIA, reduced-motion aware).
- **Motion polish**: token `--enpii-duration-*` & `--enpii-ease-*`; transisi halus (fade+scale, slide, height collapse, indicator transform) untuk menu/popover/dialog/bottom-sheet/accordion/treeview/tabs/rating/switch/toast/tooltip; `prefers-reduced-motion` -> instant; karakter motion per style layer.

### Notes
- `EnpiiCurrencyInput` internal formatter dipertahankan (typing UX), `useFormat` untuk display di luar input.

# Changelog

All notable changes to `@its-enpii/ui` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-09-06

### Changed (BREAKING)
- Style layers are now value-set only. All component selectors and `!important`
  declarations were removed from `src/styles/layers/*.css`, including the legacy
  neobrutalism selector overrides. Consumers that relied on those selectors
  should migrate to the new structural tokens.

### Added
- Structural state tokens in the base theme: `--control-border-width`,
  `--overlay-border-width`, `--press-transform`, and
  `--shadow-control-pressed`.
- `./styles/neobrutalism-tamed` layer: soft-corners brutalist value set using
  base radii and cubic-bezier motion.
- Style-layer conformance tests for token-only selectors and completeness across
  all six value sets.

## [0.7.0] - 2026-08-30

### Added
- EnpiiImageUpload (grid preview, client-side crop modal, validation),
  EnpiiMentionInput (combobox ARIA, parseMentions), EnpiiWhatsAppPreview
  (chat log preview, statuses, media bubble).

### Changed
- Full style-layer & theme conformance audit pass (high-reasoning):
  9 components had missing style-layer coverage — now 82/82 components
  covered across all five layers; 23 missing dark/theme-scoped tokens
  added to all 7 themes; 38+ hardcoded colors in base CSS converted to
  --enpii-* tokens; typography verified (zero weight-cap violations).

## [0.6.0] - 2026-08-30

### Added
- EnpiiBottomSheet (swipe-down, mobile-first, focus trap) and
  EnpiiPasswordInput (strength meter, visibility toggle).
- EnpiiTransferList (dual listbox, search) and EnpiiTimeline
  (tones, completed/pending, alternate layout).
- EnpiiColorPicker (hue/alpha sliders, hex input, swatches) and
  EnpiiSignaturePad (pointer/touch strokes, undo, toDataURL).
- EnpiiKanbanBoard (HTML5 drag & drop + keyboard-accessible move menu)
  and EnpiiQrCode (canvas render, level, PNG download; uses `qrcode`).
- All new components use t() i18n and full variant coverage in all five
  style layers.

### Changed
- `qrcode` added as runtime dependency of @its-enpii/ui (QR encoding is
  not practical to hand-roll; kept out of peer dependencies).

## [0.5.0] - 2026-08-30

### Added
- EnpiiTagInput (suggestions, maxTags, keyboard) and EnpiiOtpInput
  (auto-advance, paste distribution, complete event).
- EnpiiRating (keyboard slider, allowClear) and EnpiiSegmentedControl
  (radiogroup, animated indicator).
- EnpiiPopover (placement, flip, click-outside) and EnpiiCommandPalette
  (mod+k, fuzzy filter, grouped commands).
- EnpiiCalendar (month grid, event markers, week start, min/max) and
  EnpiiTreeView (expand/collapse, keyboard navigation, ARIA tree).
- All new components use the i18n t() layer (ID/EN).

## [0.4.0] - 2026-08-30

### Added
- EnpiiDropdownMenu — generic action menu: keyboard nav
  (ArrowUp/Down/Home/End/Escape/Enter/Space + typeahead), ARIA
  menu/menuitem, click-outside close, teleport, auto-flip placement,
  danger/disabled/divider items.
- EnpiiFileUpload — drag & drop + browse, multiple files, client-side
  type/size validation with inline errors, image thumbnails, v-model.
- Chart suite (pure SVG, zero deps): EnpiiLineChart, EnpiiAreaChart
  (multi-series), EnpiiDonutChart (legend + %), EnpiiSparkline.
- i18n layer — ~180 keys ID/EN dictionaries, createT/useT, plugin options
  `locale` + `translations`, all components refactored to t() (default
  stays Indonesian — backward compatible).

### Changed
- plugin.ts now provides enpiiI18nKey (5 provided keys total).

## [0.3.0] - 2026-08-24

### Added
- 13 new components: Navbar, Sidebar, Footer, Breadcrumb, Pagination,
  Drawer, Range, Progress, Spinner, Alert, Skeleton, Avatar, Stepper.
- 3 new form components: DateRange (presets, dual calendar), TimePicker
  (12/24h, step minutes), InputMask (no-dep masking, raw v-model).
- 5 design style layers: `styles/material`, `styles/glassmorphism`,
  `styles/neumorphism`, `styles/neobrutalism`, `styles/minimalism` —
  full component-surface coverage incl. variants, theme-agnostic.
- RichEditor rewritten on Tiptap (`@tiptap/vue-3` + starter-kit as peer
  deps); public API unchanged.
- Double-submit guard: `useFormSubmitProvider()` locks all
  `type=submit` EnpiiButtons while the form is submitting.
- Smooth motion system: emphasized easing token, accordion expand
  animation, card hover lift, overlay transitions; honors
  prefers-reduced-motion.
- Docs: root DESIGN.md + packages/ui/docs/STYLES.md.

### Changed
- Spacing normalized to a strict 4px grid (field-gap 8px, row-gap 24px).
- Unified label typography across all form controls (.8125rem/600,
  on-surface-variant, no uppercase).
- RadioGroup compacted (weight 500, tighter rows).
- Font-weight capped at 600 package-wide.
- All browser-default style leakage eliminated (appearance resets for
  buttons/inputs/checkbox/radio/range/search/datetime; WebKit+Firefox).

### Fixed
- Icon font now copied to dist/assets on build (icons previously fell
  back to raw text in consumer apps).

## [0.2.0] - 2026-08-24

First complete release of the package as a standalone Vue 3 component library.

### Added
- 43 `Enpii*` components extracted from new_sidbm (buttons, badges, cards, form
  controls, pickers, tables, modals, toasts, tabs, accordion, assistant widget,
  desktop chrome, etc.) with 9 composables.
- Pure BEM styling (`enpii-button__element--modifier`) via `styles/components.css`
  driven by design tokens in `styles/tokens.css` — no Tailwind required.
- Shape variants on cornered components: `shape="rounded" | "pill" | "sharp"`.
- Dark mode: automatic via `prefers-color-scheme`, manual via `[data-theme]`.
- 7 built-in color themes: Klasik, Gelap, Nord, Dracula, Solarized, Gruvbox,
  Rosé Pine — switchable with `useTheme` / `EnpiiThemeMenu`, persisted in
  localStorage (`enpii-theme`). Custom themes documented in THEMING.md.
- `enpiiUi` Vue plugin: host apps provide permissions, navigation callback and
  app-mode config via `app.use(enpiiUi, {...})` (provide/inject based).
- Bundled Material Symbols Outlined icon font — icons render out of the box,
  no consumer font loading needed.

### Changed
- **Zero runtime dependencies** besides the `vue` peer dependency:
  `@inertiajs/vue3` and all `@tiptap/*` packages removed.
  - Inertia coupling replaced by plugin-provided config + events/callbacks.
  - `EnpiiRichEditor` reimplemented as a self-contained contenteditable editor
    (bold/italic/underline/strike/lists/link/undo/redo) — bundle shrank from
    ~1,179 kB to ~200 kB.
- Unified control metrics: buttons, inputs, selects, smart-select and date-picker
  share one scale (`--enpii-control-height: 3rem`, font-size `1rem`,
  compact/small = 2.5rem). Fixed smart-select/date-picker inheriting the
  browser's 13.33px default font.
- `navigate()` plugin contract aligned to `navigate(path, options?)`.
- Documentation rewritten: README reflects the full component catalog; root
  README updated; THEMING.md added.

### Fixed
- Viewport-aware overlays: `EnpiiNotificationDropdown` flips above the trigger
  when space below is insufficient; `EnpiiTooltip` auto-flips side on show.
- `EnpiiToast` flash watcher now reacts to in-place flash mutations (`deep`).
- `useMarkdown` block IDs are deterministic per parse (was `Date.now()`).
- Undefined `--enpii-z-raised` token defined in every theme block.
- Button size aliases `sm`/`md`/`lg` added alongside `compact`/`default`/`large`;
  all variants share identical metrics per size.
- Misc cleanups: unused imports removed, export ordering, corrected `useMoney`
  doc example.

## [0.1.0] - 2026-08-14

- Initial publish of the UI package through GitHub Packages (presentational
  `EnpiiButton` and `EnpiiBadge` only).

[Unreleased]: https://github.com/its-enpii/enpiistudio/compare/ui-v0.2.0...HEAD
[0.2.0]: https://github.com/its-enpii/enpiistudio/compare/ui-v0.1.0...ui-v0.2.0
[0.1.0]: https://github.com/its-enpii/enpiistudio/releases/tag/ui-v0.1.0
