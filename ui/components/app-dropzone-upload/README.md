# AppDropzoneUpload

- **Framework**: Vue 3 (Script Setup)
- **Sumber Referensi**: Enpii Studio (`new_sidbm`)
- **File Target**: `component.vue`

## Deskripsi
Komponen referensi `AppDropzoneUpload` untuk drag & drop upload dengan live preview, antrean many-drop, dan proses upload sequential FIFO. Komponen mendukung mode Auto Upload, Manual Upload, progress per file, cancel, retry, hapus item, serta simulasi upload bawaan.

## Cara Penggunaan (Copy-Paste)
1. Salin `component.vue` ke direktori komponen aplikasi Anda.
2. Sesuaikan class Tailwind dan teks sesuai identitas aplikasi Anda.
3. Gunakan `uploadHandler` untuk integrasi upload nyata; tanpa handler, simulasi upload otomatis aktif.

## Props & Konfigurasi
| Prop | Tipe | Default |
| --- | --- | --- |
| `modelValue` | `Array` | `() => []` |
| `label` | `String` | `'Upload File'` |
| `hint` | `String` | `null` |
| `error` | `String` | `null` |
| `accept` | `String` | `null` |
| `multiple` | `Boolean` | `true` |
| `maxFiles` | `Number` | `10` |
| `maxFileSizeMb` | `Number` | `10` |
| `autoUpload` | `Boolean` | `false` |
| `allowModeSwitch` | `Boolean` | `true` |
| `uploadHandler` | `Function` | `null` |
| `disabled` | `Boolean` | `false` |
| `size` | `String` | `'md'` (`sm`, `md`, `lg`, `xl`) |

## Upload Handler
```js
async (file, { onProgress, signal }) => {
    // onProgress(0 - 100)
    // Periksa signal.aborted untuk cancellation.
    return result;
}
```

## Events
| Event | Payload |
| --- | --- |
| `update:modelValue` | Array queue item |
| `file-added` | `fileItem` |
| `file-success` | `{ file, result }` |
| `file-error` | `{ file, error }` |
| `queue-complete` | `allCompletedFiles` |

## Catatan Queue
- Upload dijalankan satu per satu sesuai urutan item di antrean.
- `Upload Semua` memproses semua item `queued`/`error`; upload per item tersedia di aksi baris.
- `Batal` menghentikan upload aktif dan menghentikan antrean; item gagal dapat dicoba lagi.
- Preview image memakai object URL dan dibersihkan saat item dihapus atau komponen unmount.
