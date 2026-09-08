# AppIcon

- **Framework**: Vue 3 (Script Setup)
- **Sumber Referensi**: `new_sidbm` (`resources/js/Components/AppIcon.vue`)
- **File Target**: `component.vue`

## Deskripsi
Komponen referensi `AppIcon` berbasis Vue 3 dan Tailwind CSS dari aplikasi `new_sidbm`.

## Cara Penggunaan (Copy-Paste)
1. Salin `component.vue` ke direktori komponen aplikasi Anda (misal `resources/js/Components/{f.name}`).
2. Sesuaikan class styling/Tailwind agar cocok dengan tema aplikasi Anda.

## Props & Konfigurasi
| Prop | Tipe | Default |
| --- | --- | --- |
| `filled` | `Boolean` | `false` |
| `label` | `String` | `null` |
| `tone` | `String` | `'neutral',
        validator: (value) => ['neutral', 'success', 'warning', 'danger', 'error', 'info', 'primary', 'secondary', 'tertiary'].includes(value),` |
| `containerShape` | `String` | `'rounded',
        validator: (value) => ['rounded', 'pill'].includes(value),` |
