# @its-enpii/ui

> Registry: `https://npm.pkg.github.com`

Setup-only Vue 3 package. Menyediakan design tokens CSS yang dapat dipakai bersama Tailwind serta presentational `EnpiiButton` dan `EnpiiBadge`. Bukan component library lengkap.

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

Import package dan CSS:

```ts
import { EnpiiBadge, EnpiiButton } from '@its-enpii/ui'
import '@its-enpii/ui/styles.css'
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

Distribusi tersedia sebagai `@its-enpii/ui@0.1.0` melalui GitHub Packages dan tetap internal/`UNLICENSED`. Token tidak boleh masuk repository, lockfile, log, atau image. Breaking change hanya melalui kenaikan minor selama fase `0.x`.

Tambahkan komponen lain hanya setelah pola yang sama terbukti berulang pada aplikasi produk.
