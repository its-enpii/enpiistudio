# Tailwind v4 migration

Fase 1 membangun fondasi Tailwind v4 secara paralel dengan stylesheet BEM lama. Tidak ada file komponen `.vue`, `src/styles/components.css`, atau `src/styles/tokens.css` lama yang diubah, sehingga konsumen BEM tetap aman sampai fase 2.

## Instalasi consumer

```bash
npm install @its-enpii/ui
npm install -D tailwindcss @tailwindcss/vite
```

Buat `enpii.ui.config.js` di root project:

```js
import { defineEnpiiUiConfig } from '@its-enpii/ui/config'

export default defineEnpiiUiConfig({
  theme: 'sky',
  styleLayer: 'none',
  darkMode: 'auto',
  overrides: {
    '--enpii-color-primary': '#38BDF8',
  },
})
```

Selanjutnya aktifkan plugin Vite:

```ts
import { enpiiUi } from '@its-enpii/ui/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [enpiiUi(), tailwindcss()],
})
```

Terakhir, import CSS virtual di entry utama:

```ts
import 'virtual:enpii-ui.css'
```

## Urutan resolusi

1. `theme` — mengimpor token semantik dasar, misalnya `sky`.
2. `styleLayer` — mengimpor value layer visual jika bukan `none`.
3. `overrides` — memasang token `:root` paling akhir sehingga selalu menimpa dua lapis sebelumnya.

## Dark mode

- `auto` — murni `@media (prefers-color-scheme: dark)`.
- `class` — hanya `@custom-variant dark (&:where(.dark, .dark *))`.
- `manual` — hanya `@custom-variant dark (&:where([data-theme='dark'], [data-theme='dark'] *))`.

Hanya satu trigger yang dihasilkan. Konfigurasi `auto` tetap memiliki media query asli di token tema, sementara `class` dan `manual` mengandalkan custom variant.

## Fondasi utility

Build internal menghasilkan `dist/tailwind.css`. Bundle berisi token sky light/dark, utility warna seperti `bg-primary`, `text-on-primary`, dan `border-primary-border`, utility radius seperti `rounded-control`, serta token kontrol `--enpii-control-height`. Smoke browser memverifikasi `bg-primary` menjadi `rgb(135, 206, 235)` dan `rounded-control` menjadi `9px`.

## Roadmap

- **Fase 2** — migrasi komponen ke utility Tailwind, batch kecil, 309 test lama dijaga tetap hijau per batch.
- **Fase 3** — value-set style layer (`material`, `glassmorphism`, `neumorphism`, `neobrutalism`, `minimalism`) sebagai token/variant Tailwind.
- **Fase 4** — migrasi consumer akhir, termasuk Encanteen, ke config resmi dan penghapusan jalur BEM setelah cutoff.
