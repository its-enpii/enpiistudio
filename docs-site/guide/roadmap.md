---
title: Roadmap & Milestone
---

# Roadmap & Milestone

Bagian ini meringkas `docs/progress.md`, bukan menyalin seluruh log kerja.

## Ringkasan Roadmap

1. **Selesai** — konvensi platform tertulis.
2. **Selesai** — module core Media dan Notification.
3. **Selesai** — docs site VitePress.
4. **Selesai** — Bridge: OpenAPI per module, generate types, fetch wrapper.
5. **Dihentikan** — UI dan App Skeleton bersama; aplikasi memiliki UI sendiri.
6. **Ditunda** — vertical demo sampai brief pemilik tersedia.

## Milestone yang Sudah Stabil

- **Core** sudah memuat Tenancy, Identity, Authorization, Settings, FeatureFlags, Audit, Media, dan Notification. Test monorepo mencakup perilaku tenancy, authorization, audit, media, dan notification.
- **Histori UI** tetap tersedia di Git history dan versi registry lama; status aktifnya sudah dihentikan.

## Arah Berikutnya

Prioritas berikutnya adalah memperkuat backend frontend-agnostic dan kontrak API tanpa membangun UI bersama.
