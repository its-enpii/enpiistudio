# Mengonsumsi @its-enpii/ui v1.x — model fondasi + style layer

> v1.0.0 menghapus arsitektur config-JS (`enpii.ui.config.js`, plugin
> `@its-enpii/ui/vite`, `virtual:enpii-ui.css`, preset Tailwind 3). Model sekarang
> **pure CSS-import**: package = fondasi (token + komponen), style layer = template
> visual yang **opsional**. Fondasi bisa dipakai tanpa layer mana pun.

## Instalasi

```bash
npm install @its-enpii/ui        # peer dep: vue ^3.5
npm install -D tailwindcss @tailwindcss/vite   # @its-enpii/ui/tailwind.css butuh Tailwind v4
```

Distribusi via **GitHub Packages** (`npm.pkg.github.com`), bukan npmjs.com —
butuh token `read:packages` di `.npmrc` scope `@its-enpii`.

## Integrasi CSS (urutan wajib)

Di file CSS entry consumer (mis. `resources/css/app.css`):

```css
@import "tailwindcss";                        /* 1. engine Tailwind v4 */
@import "@its-enpii/ui/tailwind.css";         /* 2. fondasi: token @theme + utilities package */
@import "@its-enpii/ui/styles/neobrutalism";  /* 3. OPSIONAL: tepat satu style layer, atau tidak sama sekali */
/* 4. opsional: @its-enpii/skeleton/styles.css (layout presets) */
/* 5. opsional: theme override consumer sendiri, SELALU paling akhir */
@import "./app-theme.css";
```

- Tanpa langkah 3, aplikasi tetap utuh memakai fondasi (radius/shadow default
  dari `@theme`), dan bisa berhenti di situ.
- Layer yang tersedia: `material`, `glassmorphism`, `neumorphism`, `neobrutalism`,
  `minimalism` — import **tepat satu**.
- Konfigurasi Vite cukup plugin Tailwind standar; tidak ada plugin Enpii lagi.

## Layer apa yang dilakukan (dan tidak dilakukan)

Layer hanyalah **value-set token + BEM marker overrides**:

- Menimpa: `--radius-*`, `--shadow-*`, `--transition-duration-*`, `--ease-*`,
  plus selector BEM marker (`.enpii-button`, `.enpii-card`, …) untuk bahasa visual
  tegas (mis. border 2px ink neobrutalism).
- Tidak menyentuh: warna/hue brand (`--color-*` tetap milik tema), sizing,
  layout, dan kontrak tinggi kontrol.

## Override token dari consumer

Timpa token Tailwind-native di CSS sendiri setelah semua import:

```css
/* app-theme.css — contoh: identitas Encanteen */
:root {
  --color-primary: #87CEEB;   /* sky */
  --color-accent: #F4B740;    /* sunflower */
  --color-ink: #14202B;
}
@media (prefers-color-scheme: dark) {
  :root { /* pasangan dark */ }
}
```

Aturan: 0 hex di layer/tema non-brand selain token ink/netral; font-weight ≤ 600;
`color-scheme: light dark` wajib ada di consumer (kontrak dark mode); verifikasi
wajib computed-style dua tema, bukan sekadar build.

## Ringkasan arsitektur

| Lapis | Isi | Wajib? |
|---|---|---|
| `tailwindcss` | engine utility | ya |
| `@its-enpii/ui/tailwind.css` | fondasi: token `@theme` + komponen | ya |
| `@its-enpii/ui/styles/<layer>` | value-set visual (template bentuk bangunan) | tidak |
| `@its-enpii/skeleton/styles.css` | layout presets | tidak |
| theme consumer | identitas brand (sky, dsb.) | disarankan, paling akhir |
