# AppAccordion

- **Framework**: Vue 3 (Script Setup)
- **Sumber Referensi**: `new_sidbm` (`resources/js/Components/AppAccordion.vue`)
- **File Target**: `component.vue`

## Deskripsi
Komponen referensi `AppAccordion` berbasis Vue 3 dan Tailwind CSS dari aplikasi `new_sidbm`.

## Cara Penggunaan (Copy-Paste)
1. Salin `component.vue` ke direktori komponen aplikasi Anda (misal `resources/js/Components/{f.name}`).
2. Sesuaikan class styling/Tailwind agar cocok dengan tema aplikasi Anda.

## Props & Konfigurasi
| Prop | Tipe | Default |
| --- | --- | --- |
| `items` | `Array` | `null` |
| `title` | `String` | `''` |
| `subtitle` | `String` | `null` |
| `icon` | `String` | `null` |
| `defaultOpen` | `Boolean` | `false` |
| `multiple` | `Boolean` | `false` |
| `bordered` | `Boolean` | `true` |
| `variant` | `String` | `'surface',
        validator: (val) => ['surface', 'filled', 'ghost'].includes(val),` |

**Emits**: `'toggle'`

**Slots**: `default`, `title`
