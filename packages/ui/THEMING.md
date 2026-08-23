# Panduan Tema Enpii UI

## Menggunakan tema

Import `@its-enpii/ui/styles.css` sekali di aplikasi. Gunakan `useTheme` untuk membaca atau mengubah tema aktif:

```vue
<script setup>
import { useTheme } from '@its-enpii/ui'

const { theme, themes, setTheme } = useTheme()
</script>

<template>
  <select :value="theme" @change="setTheme($event.target.value)">
    <option v-for="item in themes" :key="item.id" :value="item.id">
      {{ item.label }}
    </option>
  </select>
</template>
```

`useTheme` menyimpan pilihan di `localStorage` pada kunci `enpii-theme`, lalu menyetel atribut `data-theme` ke `<html>`. Untuk menu siap pakai, render `<EnpiiThemeMenu v-model="open" />` dari package yang sama.

## Tema bawaan

| ID | Palet |
| --- | --- |
| `classic` | Klasik terang Enpii |
| `dark` | Gelap modern |
| `nord` | Nord |
| `dracula` | Dracula |
| `solarized` | Solarized Light |
| `gruvbox` | Gruvbox Dark |
| `rosepine` | Rosé Pine |

## Tema kustom

Buat blok atribut sendiri dan override token utama setelah CSS package dimuat:

```css
[data-theme='acme'] {
  --enpii-color-primary: #0f766e;
  --enpii-color-primary-hover: #115e59;
  --enpii-color-on-primary: #ffffff;
  --enpii-color-primary-container: #99f6e4;
  --enpii-color-on-primary-container: #042f2e;
  --enpii-color-secondary: #1d4ed8;
  --enpii-color-on-secondary: #ffffff;
  --enpii-color-error: #b91c1c;
  --enpii-color-on-error: #ffffff;
  --enpii-color-surface: #f8fafc;
  --enpii-color-on-surface: #0f172a;
}
```

Setel `data-theme="acme"` pada `<html>`. Override sebanyak token yang diperlukan; token yang tidak ditulis akan mewarisi nilai `:root`.

## Dark mode otomatis

Tanpa atribut `data-theme`, media `prefers-color-scheme: dark` mengaktifkan tema gelap bawaan. Pilihan manual lewat `data-theme` atau `useTheme` tetap menang atas preferensi sistem. Gunakan `data-theme="classic"` untuk memaksa tema terang.
