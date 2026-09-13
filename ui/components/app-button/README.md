# AppButton

- **Framework**: Vue 3 (Script Setup)
- **Sumber Referensi**: `new_sidbm` (`resources/js/Components/AppButton.vue`)
- **File Target**: `component.vue`

## Deskripsi
Komponen referensi `AppButton` berbasis Vue 3 dan Tailwind CSS dari aplikasi `new_sidbm`.

## Cara Penggunaan (Copy-Paste)
1. Salin `component.vue` ke direktori komponen aplikasi Anda (misal `resources/js/Components/{f.name}`).
2. Sesuaikan class styling/Tailwind agar cocok dengan tema aplikasi Anda.

## Props & Konfigurasi
| Prop | Tipe | Default |
| --- | --- | --- |
| `variant` | `String` | `'primary'` |
| `size` | `String` | `'md'` (`sm`, `md`, `lg`, `xl`, alias `compact`, `default`, `large`) |
| `icon` | `String` | `null` |
| `trailingIcon` | `String` | `null` |
| `iconOnly` | `Boolean` | `false` |
| `loading` | `Boolean` | `false` |
| `disabled` | `Boolean` | `false` |
| `type` | `String` | `'button'` |
| `ariaLabel` | `String` | `null` |

**Slots**: `default`

Alias kompatibilitas: `compact` → `sm`, `default` → `md`, `large` → `lg`.
