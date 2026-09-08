# AppIconButton

- **Framework**: Vue 3 (Script Setup)
- **Sumber Referensi**: `new_sidbm` (`resources/js/Components/AppIconButton.vue`)
- **File Target**: `component.vue`

## Deskripsi
Komponen referensi `AppIconButton` berbasis Vue 3 dan Tailwind CSS dari aplikasi `new_sidbm`.

## Cara Penggunaan (Copy-Paste)
1. Salin `component.vue` ke direktori komponen aplikasi Anda (misal `resources/js/Components/{f.name}`).
2. Sesuaikan class styling/Tailwind agar cocok dengan tema aplikasi Anda.

## Props & Konfigurasi
| Prop | Tipe | Default |
| --- | --- | --- |
| `tone` | `String` | `'neutral',
        validator: (value) => ['neutral', 'success', 'warning', 'danger', 'error', 'info', 'primary', 'secondary', 'tertiary'].includes(value),` |
| `size` | `String` | `'md',
        validator: (value) => ['sm', 'md', 'lg'].includes(value),` |
| `rounded` | `String` | `'lg',
        validator: (value) => ['square', 'lg', 'full'].includes(value),` |
| `filled` | `Boolean` | `false` |
| `loading` | `Boolean` | `false` |
| `disabled` | `Boolean` | `false` |
| `type` | `String` | `'button'` |
| `ariaLabel` | `String` | `null` |
| `tooltip` | `String` | `null` |
