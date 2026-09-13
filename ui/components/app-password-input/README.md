# AppPasswordInput

- **Framework**: Vue 3 (Script Setup)
- **File Target**: `component.vue`

## Deskripsi
Komponen referensi input kata sandi berbasis Vue 3 dan Tailwind CSS, dengan toggle tampilkan/sembunyikan bawaan dan sistem tinggi seragam.

## Cara Penggunaan (Copy-Paste)
1. Salin `component.vue` ke direktori komponen aplikasi Anda.
2. Sesuaikan class Tailwind agar cocok dengan tema dan identitas visual aplikasi Anda.

## Props & Konfigurasi
| Prop | Tipe | Default |
| --- | --- | --- |
| `modelValue` | `String` | `''` |
| `size` | `String` | `'md'` (`sm`, `md`, `lg`, `xl`) |
| `id` | `String` | `null` |
| `label` | `String` | `'Kata Sandi'` |
| `icon` | `String` | `'lock'` |
| `autocomplete` | `String` | `'current-password'` |
| `placeholder` | `String` | `'••••••••'` |
| `error` | `String` | `null` |
| `hint` | `String` | `null` |
| `readonly` | `Boolean` | `false` |
| `hideLabel` | `Boolean` | `false` |
| `tooltip` | `String` | `null` |
| `disabled` | `Boolean` | `false` |
| `required` | `Boolean` | `false` |

**Slots**: `leading`, `trailing`

**V-model**: `v-model="password"`
