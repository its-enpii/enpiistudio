---
title: Roadmap & Milestone
---

# Roadmap & Milestone

Bagian ini meringkas `docs/progress.md`, bukan menyalin seluruh log kerja.

## Ringkasan Roadmap

1. **Selesai** — konvensi platform tertulis.
2. **Selesai** — module core Media dan Notification.
3. **Aktif** — docs site VitePress.
4. **Belum** — Bridge: OpenAPI per module, generate types, fetch wrapper.
5. **Belum** — App Skeleton: layout preset dan `brand.css`.
6. **Ditunda** — vertical demo sampai brief pemilik tersedia.

## Milestone yang Sudah Stabil

- **UI package** sudah dirilis sebagai v0.8.0 melalui GitHub Packages. Catatan progres lama menulis 82 komponen, sedangkan export sumber saat ini berisi 84 komponen `Enpii*`. Situs ini mengikuti hasil generator dari `src/index.ts`.
- **Core** sudah memuat Tenancy, Identity, Authorization, Settings, FeatureFlags, Audit, Media, dan Notification. Test monorepo mencakup perilaku tenancy, authorization, audit, media, dan notification.
- **Conformance UI** sudah diaudit untuk komponen terhadap lima style layer, tujuh tema, batas weight, motion, dan focus ring.

## Arah Berikutnya

Prioritas berikutnya adalah Bridge untuk menghubungkan kontrak OpenAPI, TypeScript types, dan fetch client, lalu App Skeleton sebagai titik awal aplikasi konsumen.
