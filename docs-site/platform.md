---
title: Ringkasan Platform
---

# Ringkasan Platform

Enpii Studio adalah fondasi backend frontend-agnostic untuk aplikasi Laravel multi-tenant. Core berjalan in-process dan menyediakan Tenancy, Identity, Authorization, Settings, FeatureFlags, Audit, Media, serta Notification. Aplikasi produk tetap berdiri sebagai modular monolith dengan deployment, release cycle, dan UI sendiri.

## Prinsip Utama

- **Konsistensi lebih penting daripada kebaruan.** Module baru mengikuti struktur dan pola module yang sudah ada.
- **Kontrak sebelum implementasi.** Perubahan lintas package dimulai dari spec atau kontrak yang jelas.
- **Backend agnostik frontend.** Core tidak mengasumsikan framework UI, component library, styling, atau identity visual aplikasi.
- **Fail-closed untuk tenancy dan permission.** Guard sensitif tidak dilonggarkan.

## Arsitektur

| Bagian | Peran | Konsumsi |
| --- | --- | --- |
| `packages/core` | Library Laravel fondasi | In-process di aplikasi produk |
| `packages/whatsapp-client` | Client WhatsApp | In-process di aplikasi produk |
| `services/whatsapp-gateway` | Gateway WhatsApp | Dependensi jaringan terpisah |

## Kepemilikan UI

`@its-enpii/ui` dan `@its-enpii/skeleton` sudah tidak dikembangkan lagi di repositori ini. Aplikasi baru harus memiliki layout, komponen, styling, dan identity visual sendiri. Aplikasi lama yang masih memakai versi yang pernah dipublikasikan harus memelihara atau memigrasikan UI tersebut secara mandiri; registry version tidak dihapus.

## Peta Dokumentasi

- [Konvensi platform](/guide/platform-conventions) menjadi kontrak untuk module dan package baru.
- [Core](/core/tenancy) menjelaskan perilaku runtime dan contoh kode asli.
- [Roadmap & milestone](/guide/roadmap) merangkum status progres.
