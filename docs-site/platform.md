---
title: Ringkasan Platform
---

# Ringkasan Platform

Enpii Studio adalah fondasi reusable untuk aplikasi Laravel multi-tenant. Core berjalan in-process dan menyediakan Tenancy, Identity, Authorization, Settings, FeatureFlags, Audit, Media, serta Notification. Aplikasi produk tetap berdiri sebagai modular monolith dengan deployment dan release cycle sendiri.

## Prinsip Utama

- **Konsistensi lebih penting daripada kebaruan.** Module baru mengikuti struktur dan pola module yang sudah ada.
- **Kontrak sebelum implementasi.** Perubahan lintas package dimulai dari spec atau kontrak yang jelas.
- **Backend agnostik frontend.** Core tidak berasumsi konsumen memakai UI package.
- **Fail-closed untuk tenancy dan permission.** Guard sensitif tidak dilonggarkan.

## Arsitektur

| Bagian | Peran | Konsumsi |
| --- | --- | --- |
| `packages/core` | Library Laravel fondasi | In-process di aplikasi produk |
| `packages/ui` | Vue 3 presentational components | Frontend Vue |
| `packages/whatsapp-client` | Client WhatsApp | In-process di aplikasi produk |
| `services/whatsapp-gateway` | Gateway WhatsApp | Dependensi jaringan terpisah |

## Peta Dokumentasi

- [Konvensi platform](/guide/platform-conventions) menjadi kontrak untuk module dan package baru.
- [Core](/core/tenancy) menjelaskan perilaku runtime dan contoh kode asli.
- [UI](/ui/) menjelaskan konsumsi, token, komponen, dan style layer.
- [Roadmap & milestone](/guide/roadmap) merangkum status progres.
