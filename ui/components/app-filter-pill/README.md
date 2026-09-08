# AppFilterPill

- **Framework**: Vue 3 (Script Setup)
- **Sumber Referensi**: `new_sidbm` (`resources/js/Components/AppFilterPill.vue`)
- **File Target**: `component.vue`

## Deskripsi
Komponen referensi `AppFilterPill` berbasis Vue 3 dan Tailwind CSS dari aplikasi `new_sidbm`.

## Cara Penggunaan (Copy-Paste)
1. Salin `component.vue` ke direktori komponen aplikasi Anda (misal `resources/js/Components/{f.name}`).
2. Sesuaikan class styling/Tailwind agar cocok dengan tema aplikasi Anda.

## Props & Konfigurasi
| Prop | Tipe | Default |
| --- | --- | --- |
| `variant` | `String` | `'outline',
        validator: (value) => ['outline', 'solid', 'segment'].includes(value),` |
| `size` | `String` | `'default',
        validator: (value) => ['default', 'compact'].includes(value),` |
| `ariaLabel` | `String` | `'Filter'` |

**Emits**: `'update:modelValue'`
