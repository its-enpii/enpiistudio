# Arsip keputusan UI bersama

Status: **dihentikan** (2026-09-07).

`@its-enpii/ui` dan `@its-enpii/skeleton` pernah dikembangkan di repositori ini sebagai package komponen/layout bersama. Arah produk berubah: Enpii Studio fokus pada backend frontend-agnostic, sementara identity, layout, komponen, dan styling dimiliki tiap aplikasi.

## Fakta untuk konsumen

- Source package dihapus dari branch aktif; histori lengkap tetap ada di Git history.
- Versi yang pernah dipublikasikan tetap tersedia di registry dan sengaja tidak dihapus atau diubah.
- Enpii Studio tidak menyediakan upgrade path atau penerus untuk package tersebut.
- Aplikasi lama harus mem-pinned versi yang dipakai, memelihara salinan UI-nya sendiri, atau memigrasikannya ke kode aplikasi.
- Aplikasi baru tidak boleh menambahkan dependensi ke package tersebut.

Dokumen migrasi/release lama tidak lagi dipertahankan sebagai instruksi aktif. Gunakan Git history untuk melihatnya.
