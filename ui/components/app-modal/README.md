# AppModal

- **Framework**: Vue 3 (Script Setup)
- **Sumber Referensi**: `new_sidbm` (`resources/js/Components/AppModal.vue`)
- **File Target**: `component.vue`

## Deskripsi
Komponen referensi `AppModal` berbasis Vue 3 dan Tailwind CSS dari aplikasi `new_sidbm`.

## Cara Penggunaan (Copy-Paste)
1. Salin `component.vue` ke direktori komponen aplikasi Anda (misal `resources/js/Components/{f.name}`).
2. Sesuaikan class styling/Tailwind agar cocok dengan tema aplikasi Anda.

## Props & Konfigurasi
| Prop | Tipe | Default |
| --- | --- | --- |
| `closeable` | `Boolean` | `true` |
| `size` | `String` | `'md',
        validator: (value) => ['sm', 'md', 'lg', 'full'].includes(value),` |

**Slots**: `default`, `footer`
