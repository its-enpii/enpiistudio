---
title: Ringkasan UI
---

# Ringkasan UI

`@its-enpii/ui` adalah library komponen Vue 3 presentasional. Ia menyediakan struktur komponen, token CSS, behavior presentasional, dan helper ringan; state aplikasi, data fetching, dan keputusan domain tetap milik aplikasi.

## Aturan Pakai

- **Peer dependency hanya Vue.** Package tidak membawa framework styling tambahan.
- **CSS BEM + token.** Gunakan token `--enpii-*`; jangan menulis warna atau ukuran baru di luar sistem.
- **Prefix `Enpii`.** Semua komponen memakai nama bawaan package.
- **Weight cap.** Bahasa visual mengikuti batas ketebalan font style layer; base tidak memaksa tampilan baru.
- **Sizing dan layout milik base.** Style layer hanya mengubah warna, radius, border, shadow, dan transisi.

## Instalasi

Package dirilis melalui GitHub Packages dengan lisensi internal. Pasang registry dan autentikasi sesuai runbook setup monorepo.

```ts
import { EnpiiBadge, EnpiiButton } from '@its-enpii/ui'
import '@its-enpii/ui/styles.css'
```

Import `./styles.css` atau alias `./tokens.css` hanya salah satu; keduanya menunjuk artifact CSS yang sama.
