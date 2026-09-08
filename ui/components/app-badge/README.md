# AppBadge

- **Framework**: Vue 3 (Script Setup)
- **Sumber Referensi**: `new_sidbm` (`resources/js/Components/AppBadge.vue`)
- **File Target**: `component.vue`

## Deskripsi
Komponen referensi `AppBadge` berbasis Vue 3 dan Tailwind CSS dari aplikasi `new_sidbm`.

## Cara Penggunaan (Copy-Paste)
1. Salin `component.vue` ke direktori komponen aplikasi Anda (misal `resources/js/Components/{f.name}`).
2. Sesuaikan class styling/Tailwind agar cocok dengan tema aplikasi Anda.

## Props & Konfigurasi
| Prop | Tipe | Default |
| --- | --- | --- |
| `tone` | `String` | `'neutral',
        validator: (value) => [
            // Solid tones (default)
            'neutral', 'success', 'warning', 'error', 'primary',
            // Soft tones — lighter background, stronger text. Useful when paired
            // next to other UI elements (rows, cells, banners).
            'success-soft', 'warning-soft', 'error-soft', 'info-soft', 'primary-soft',
        ].includes(value),` |

**Slots**: `default`
