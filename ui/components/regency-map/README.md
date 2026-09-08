# RegencyMap

- **Framework**: Vue 3 (Script Setup)
- **Sumber Referensi**: `new_sidbm` (`resources/js/Components/RegencyMap.vue`)
- **File Target**: `component.vue`

## Deskripsi
Komponen referensi `RegencyMap` berbasis Vue 3 dan Tailwind CSS dari aplikasi `new_sidbm`.

## Cara Penggunaan (Copy-Paste)
1. Salin `component.vue` ke direktori komponen aplikasi Anda (misal `resources/js/Components/{f.name}`).
2. Sesuaikan class styling/Tailwind agar cocok dengan tema aplikasi Anda.

## Props & Konfigurasi
| Prop | Tipe | Default |
| --- | --- | --- |
| `regencyName` | `String` | `'Kabupaten'` |
| `regencyCenter` | `Object` | `() => ({ lat: -7.5, lng: 109.5, zoom: 10` |

**Emits**: `'select-tenant'`
