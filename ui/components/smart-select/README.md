# SmartSelect

- **Framework**: Vue 3 (Script Setup)
- **Sumber Referensi**: `new_sidbm` (`resources/js/Components/SmartSelect.vue`)
- **File Target**: `component.vue`

## Deskripsi
Komponen referensi `SmartSelect` berbasis Vue 3 dan Tailwind CSS dari aplikasi `new_sidbm`.

## Cara Penggunaan (Copy-Paste)
1. Salin `component.vue` ke direktori komponen aplikasi Anda (misal `resources/js/Components/{f.name}`).
2. Sesuaikan class styling/Tailwind agar cocok dengan tema aplikasi Anda.

## Props & Konfigurasi
| Prop | Tipe | Default |
| --- | --- | --- |
| `options` | `Array` | `() => []` |
| `placeholder` | `String` | `null` |
| `error` | `String` | `null` |
| `hint` | `String` | `null` |
| `disabled` | `Boolean` | `false` |
| `clearable` | `Boolean` | `false` |
| `required` | `Boolean` | `false` |
| `searchable` | `Boolean` | `false` |
| `loading` | `Boolean` | `false` |
| `valueKey` | `String` | `'value'` |
| `labelKey` | `String` | `'label'` |
| `groupKey` | `String` | `'group'` |
| `id` | `String` | `null` |
| `hideLabel` | `Boolean` | `false` |
| `emptyActionLabel` | `String` | `null` |
| `excludedValues` | `Array` | `() => []` |

**Emits**: `'update:modelValue', 'search', 'search-change', 'empty-action'`
