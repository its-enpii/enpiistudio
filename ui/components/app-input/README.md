# AppInput

- **Framework**: Vue 3 (Script Setup)
- **Sumber Referensi**: `new_sidbm` (`resources/js/Components/AppInput.vue`)
- **File Target**: `component.vue`

## Deskripsi
Komponen referensi `AppInput` berbasis Vue 3 dan Tailwind CSS dari aplikasi `new_sidbm`.

## Cara Penggunaan (Copy-Paste)
1. Salin `component.vue` ke direktori komponen aplikasi Anda (misal `resources/js/Components/{f.name}`).
2. Sesuaikan class styling/Tailwind agar cocok dengan tema aplikasi Anda.

## Props & Konfigurasi
| Prop | Tipe | Default |
| --- | --- | --- |
| `modelValue` | `String`, `Number` | `''` |
| `size` | `String` | `'md'` (`sm`, `md`, `lg`, `xl`) |
| `id` | `String` | `null` |
| `label` | `String` | required |
| `type` | `String` | `'text'` |
| `icon` | `String` | `null` |
| `trailingIcon` | `String` | `null` |
| `clearable` | `Boolean` | `false` |
| `error` | `String` | `null` |
| `hint` | `String` | `null` |
| `placeholder` | `String` | `null` |
| `readonly` | `Boolean` | `false` |
| `hideLabel` | `Boolean` | `false` |
| `tooltip` | `String` | `null` |
| `disabled` | `Boolean` | `false` |

**Slots**: `leading`, `trailing`

**V-model**: `v-model="value"`

Tinggi default mengikuti sistem control height: `sm` 40px, `md` 48px, `lg` 56px, dan `xl` 64px.
