# AppTabs

- **Framework**: Vue 3 (Script Setup)
- **Sumber Referensi**: `new_sidbm` (`resources/js/Components/AppTabs.vue`)
- **File Target**: `component.vue`

## Deskripsi
Komponen referensi `AppTabs` berbasis Vue 3 dan Tailwind CSS dari aplikasi `new_sidbm`.

## Cara Penggunaan (Copy-Paste)
1. Salin `component.vue` ke direktori komponen aplikasi Anda (misal `resources/js/Components/{f.name}`).
2. Sesuaikan class styling/Tailwind agar cocok dengan tema aplikasi Anda.

## Props & Konfigurasi
| Prop | Tipe | Default |
| --- | --- | --- |
| `variant` | `String` | `'underline',
        validator: (value) => ['underline', 'pill', 'pills', 'pills-bar', 'pill-bar'].includes(value),` |
| `vertical` | `Boolean` | `false` |
| `ariaLabel` | `String` | `'Tab'` |

**Emits**: `'update:modelValue'`
