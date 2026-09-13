# AppImageInput

- **Framework**: Vue 3 (Script Setup)
- **File Target**: `component.vue`

## Deskripsi
Komponen referensi input gambar berbasis Vue 3 dan Tailwind CSS untuk form web/admin. Mendukung mode inline `compact`, mode preview besar `card`/`dropzone`, drag-and-drop, preview thumbnail, dan validasi ukuran file.

## Cara Penggunaan (Copy-Paste)
1. Salin `component.vue` ke direktori komponen aplikasi Anda.
2. Sesuaikan class Tailwind agar cocok dengan tema dan identitas visual aplikasi Anda.

## Props & Konfigurasi
| Prop | Tipe | Default |
| --- | --- | --- |
| `modelValue` | `File`, `String`, `Object` | `null` |
| `size` | `String` | `'md'` (`sm`, `md`, `lg`, `xl`) |
| `id` | `String` | `null` |
| `label` | `String` | required |
| `variant` | `String` | `'compact'` (`compact`, `card`, `dropzone`) |
| `accept` | `String` | `'image/png,image/jpeg,image/webp,image/svg+xml'` |
| `icon` | `String` | `'add_photo_alternate'` |
| `maxSizeMb` | `Number` | `5` |
| `error` | `String` | `null` |
| `hint` | `String` | `null` |
| `hideLabel` | `Boolean` | `false` |
| `tooltip` | `String` | `null` |
| `disabled` | `Boolean` | `false` |
| `readonly` | `Boolean` | `false` |
| `clearable` | `Boolean` | `true` |

**V-model**: `v-model="image"`

**Events**: `validation-error`, `validation-success`

Mode `compact` mengikuti control height sistem (`40/48/56/64px`). Mode `card` dan `dropzone` menggunakan area preview besar untuk kebutuhan hero/upload.
