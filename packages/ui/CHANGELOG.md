# Changelog

All notable changes to `@its-enpii/ui` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
