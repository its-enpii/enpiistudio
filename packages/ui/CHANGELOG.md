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

## [Unreleased]

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
