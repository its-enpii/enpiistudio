# AppCheckbox

- **Framework**: Vue 3 (Script Setup)
- **Sumber Referensi**: `new_sidbm` (`resources/js/Components/AppCheckbox.vue`)
- **File Target**: `component.vue`

## Deskripsi
Komponen referensi `AppCheckbox` berbasis Vue 3 dan Tailwind CSS dari aplikasi `new_sidbm`.

## Cara Penggunaan (Copy-Paste)
1. Salin `component.vue` ke direktori komponen aplikasi Anda (misal `resources/js/Components/{f.name}`).
2. Sesuaikan class styling/Tailwind agar cocok dengan tema aplikasi Anda.

## Props & Konfigurasi
| Prop | Tipe | Default |
| --- | --- | --- |
| `label` | `String` | `null` |
| `description` | `String` | `null` |
| `icon` | `String` | `null` |
| `indeterminate` | `Boolean` | `false` |
| `disabled` | `Boolean` | `false` |
| `variant` | `String` | `'cell',
        validator: (value) => ['cell', 'inline', 'field'].includes(value),` |

**Emits**: `'update:modelValue'`

**Slots**: `label`
