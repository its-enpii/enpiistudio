---
title: Token dan Style Layer
---

# Token dan Style Layer

## Sistem Token

Semua visual UI dibangun dari custom properties berawalan `--enpii-*`: warna primary dan semantic, warna permukaan, teks, focus, radius, spacing, motion, dan font stack. Aplikasi hanya menimpa token setelah stylesheet package dimuat.

```css
@import '@its-enpii/ui/styles.css';

:root {
  --enpii-color-primary: #1d4ed8;
  --enpii-color-primary-hover: #1e40af;
}
```

## Style Layer

Lima layer tersedia:

1. Material
2. Glassmorphism
3. Neumorphism
4. Neobrutalism
5. Minimalism

Prinsip layer:

- Base `components.css` tetap pemilik sizing dan layout.
- Layer hanya mengubah bahasa visual: warna, shadow, radius, border, weight, dan transisi.
- Focus ring dipertahankan.
- Perubahan gerak menghormati `prefers-reduced-motion`.
- Batas `font-weight`: maksimal 500 untuk Material, Glassmorphism, Neumorphism, dan Minimalism; maksimal 600 untuk Neobrutalism.

## Kontrak VitePress

Situs dokumentasi ini memakai default theme dengan aksen near-black `rgb(13 13 13)` dan aksen netral. Warna murni `#000` dan `#fff` sengaja tidak dipakai agar arah visual tetap tenang dan profesional.
