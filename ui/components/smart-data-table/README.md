# SmartDataTable

- **Framework**: Vue 3 (Script Setup)
- **Sumber Referensi**: `new_sidbm` (`resources/js/Components/SmartDataTable.vue`)
- **File Target**: `component.vue`

## Deskripsi
Komponen referensi `SmartDataTable` berbasis Vue 3 dan Tailwind CSS dari aplikasi `new_sidbm`.

## Cara Penggunaan (Copy-Paste)
1. Salin `component.vue` ke direktori komponen aplikasi Anda (misal `resources/js/Components/{f.name}`).
2. Sesuaikan class styling/Tailwind agar cocok dengan tema aplikasi Anda.

## Props & Konfigurasi
| Prop | Tipe | Default |
| --- | --- | --- |
| `rows` | `Array` | `() => []` |
| `search` | `String` | `''` |
| `searchPlaceholder` | `String` | `'Cari data...'` |
| `searchLabel` | `String` | `'Pencarian'` |
| `perPageOptions` | `Array` | `() => [15, 30, 50, 100]` |
| `sort` | `String` | `''` |
| `direction` | `String` | `'asc'` |
| `emptyTitle` | `String` | `'Belum ada data'` |
| `emptyDescription` | `String` | `'Belum ada data untuk ditampilkan.'` |

**Slots**: `default`, `actions`, `toolbar`
