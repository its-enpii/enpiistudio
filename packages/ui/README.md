# @its-enpii/ui

> Registry: `https://npm.pkg.github.com`

Vue 3 package internal. Menyediakan design tokens CSS yang dapat dipakai bersama Tailwind serta 43 komponen `Enpii*` bergaya BEM (presentasional dan interaktif: form, tabel, modal, toast, dsb.) beserta plugin `enpiiUi` untuk injeksi konfigurasi aplikasi (permissions, app mode, navigasi, flash).

## Konsumsi

Untuk real project, buat `.npmrc` tanpa menyimpan token literal:

```ini
@its-enpii:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_PACKAGES_TOKEN}
```

Isi `GITHUB_PACKAGES_TOKEN` melalui environment dengan PAT classic yang memiliki `read:packages`, lalu pasang rilis:

```bash
npm install @its-enpii/ui@^0.1
```

Pasang plugin sekali di entry aplikasi agar composable (`useCan`, `useAppMode`, `useKeyboardShortcuts`) membaca konfigurasi yang sama:

```ts
import { createApp } from 'vue'
import { enpiiUi } from '@its-enpii/ui'
import '@its-enpii/ui/styles.css'
import App from './App.vue'

createApp(App)
  .use(enpiiUi, {
    permissions: ['loans.view'],
    appMode: { isDesktop: false },
    navigate: (path) => { /* router Inertia/router app */ },
    logout: () => { /* ... */ },
    flash: {},
  })
  .mount('#app')
```

Komponen dapat diimpor satu per satu:

```ts
import { EnpiiBadge, EnpiiButton, EnpiiCard } from '@its-enpii/ui'
```

```vue
<EnpiiButton @click="save">Simpan</EnpiiButton>
<EnpiiBadge tone="success" pill>Aktif</EnpiiBadge>
<EnpiiCard padded>Isi kartu</EnpiiCard>
```

Button memakai elemen `<button>`, default `type="button"`, native `disabled`, focus ring terlihat, dan slot untuk accessible name. Untuk submit form, isi `type="submit"` eksplisit. Badge memakai `<span>` presentasional; label teks wajib menjelaskan makna, bukan warna saja. Komponen ikon (`EnpiiIcon`) merender glyph `material-symbols-outlined`; aplikasi konsumen wajib memuat font Material Symbols itu sendiri.

`styles.css` adalah kontrak CSS publik tunggal; `tokens.css` menjadi alias kompatibilitas ke artifact yang sama, bukan stylesheet kedua. Import salah satu saja. Override custom properties `--enpii-*` setelah import package. Tailwind consumer dapat memetakan token pada theme sendiri tanpa package ini memaksa versi atau konfigurasi Tailwind. Palet indigo, semantic emerald/amber/red/slate, radius, spacing, serta font stack mengacu secara read-only pada Encore lokal. Forced-colors mempertahankan border, focus, disabled, dan badge contrast; `prefers-reduced-motion` mematikan transisi/animasi.

Tema: tujuh tema bawaan (`classic`, `dark`, `nord`, `dracula`, `solarized`, `gruvbox`, `rosepine`) diaktifkan lewat atribut `data-theme` pada `<html>`; lihat [THEMING.md](THEMING.md). Tanpa atribut, `prefers-color-scheme: dark` mengaktifkan varian gelap otomatis.

Daftar lengkap 43 komponen tersedia pada [`src/index.ts`](src/index.ts). Composable yang diekspor dari root package hanya `useShape` dan `useTheme`; composable lain (`useAppMode`, `useCan`, `useConfirm`, `useKeyboardShortcuts`, `useMarkdown`, `useMoney`, `usePeriodOptions`, `useToast`) berada di dalam bundle dan dipakai oleh komponen.


## Internationalisasi (i18n)

Package menyediakan mekanisme i18n ringan tanpa dependency eksternal. Semua string hardcoded Indonesia pada komponen kini dapat dialihkan ke Bahasa Inggris atau bahasa lain melalui plugin `enpiiUi`.

### Mengatur locale dan terjemahan

```ts
createApp(App)
  .use(enpiiUi, {
    locale: 'en',
    translations: {
      en: {
        'modal.close': 'Close dialog',
        'smartTable.searchPlaceholder': 'Cari data',
      },
    },
  })
  .mount('#app')
```

- `locale` — kode bahasa (default: `'id'`). Bahasa bawaan tersedia: `id` (Indonesia) dan `en` (Inggris).
- `translations` — objek `{ locale: { key: value } }` untuk override atau menambah bahasa baru. Override di-merge di atas kamus bawaan.

### Menggunakan `t()` di luar komponen package

```ts
import { useT } from '@its-enpii/ui'

// Di dalam komponen Vue:
const t = useT()
t('modal.close') // 'Tutup modal' (ID) atau 'Close modal' (EN)
t('smartTable.summary', { from: 1, to: 15, total: 100 }) // 'Menampilkan 1–15 dari 100 data'
```

Fungsi `t(key, params?)` menerima parameter `{ nama: nilai }` yang menggantikan placeholder `{nama}` pada string terjemahan. Jika key tidak ditemukan, nilai `key` dikembalikan apa adanya (fallback ke ID bila tersedia).

### Ekspor i18n

- `useT` — composable untuk mendapatkan fungsi `t` (inject atau fallback ID).
- `createT(locale, overrides?)` — membuat fungsi `t` mandiri tanpa Vue context.
- `enpiiI18nKey` — injection key untuk `provide`/`inject`.
- `builtinDictionaries` — objek kamus bawaan (`{ id, en }`).
- `TranslationDictionary` dan `TranslationMap` — tipe TypeScript.

## Verifikasi

```bash
npm install
npm run ui:check
npm run ui:test
npm run ui:build
npm run ui:pack
```

Distribusi tersedia sebagai `@its-enpii/ui@0.1.0` melalui GitHub Packages dan tetap internal/`UNLICENSED`. Token tidak boleh masuk repository, lockfile, log, atau image. Breaking change hanya melalui kenaikan minor selama fase `0.x`.

Pengujian saat ini mencakup semantik `EnpiiButton`, plugin `enpiiUi`, varian shape pada `EnpiiButton`/`EnpiiCard`, dan render `EnpiiBadge`. Komponen lain belum punya test khusus.

Tambahkan komponen lain hanya setelah pola yang sama terbukti berulang pada aplikasi produk.
