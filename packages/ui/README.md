# @enpii-studio/ui

Setup-only Vue 3 package. Menyediakan design tokens CSS yang dapat dipakai bersama Tailwind serta presentational `EnpiiButton` dan `EnpiiBadge`. Bukan component library lengkap.

## Konsumsi

Saat iterasi lokal, tambahkan dependency path/workspace dari aplikasi frontend, lalu import package dan CSS hasil build:

```ts
import { EnpiiBadge, EnpiiButton } from '@enpii-studio/ui'
import '@enpii-studio/ui/styles.css'
```

```vue
<EnpiiButton @click="save">Simpan</EnpiiButton>
<EnpiiBadge tone="success" pill>Aktif</EnpiiBadge>
```

Button memakai elemen `<button>`, default `type="button"`, native `disabled`, focus ring terlihat, dan slot untuk accessible name. Untuk submit form, isi `type="submit"` eksplisit. Badge memakai `<span>` presentasional; label teks wajib menjelaskan makna, bukan warna saja.

`styles.css` adalah kontrak CSS publik tunggal; `tokens.css` menjadi alias kompatibilitas ke artifact yang sama, bukan stylesheet kedua. Import salah satu saja. Override custom properties `--enpii-*` setelah import package. Tailwind consumer dapat memetakan token pada theme sendiri tanpa package ini memaksa versi atau konfigurasi Tailwind. Palet indigo, semantic emerald/amber/red/slate, radius, spacing, serta font stack mengacu secara read-only pada Encore lokal. Kekurangan aksesibilitas referensi—button tanpa type, icon-only tanpa label, animated status, serta focus non-`visible`—tidak direplikasi. Forced-colors mempertahankan border, focus, disabled, dan badge contrast.

Package sengaja tidak menyediakan modal, dropdown, tabs, toast, dismissible chips, interactive menu, atau komponen lain yang membutuhkan state/JavaScript behavior.

## Verifikasi

```bash
npm install
npm run ui:check
npm run ui:test
npm run ui:build
npm run ui:pack
```

Distribusi tetap private/internal. Sebelum dipakai lintas produk, naikkan versi `0.x` dengan SemVer dan publish ke registry private; breaking change boleh terjadi hanya melalui kenaikan minor selama fase `0.x`.

Tambahkan komponen lain hanya setelah pola yang sama terbukti berulang pada aplikasi produk.
