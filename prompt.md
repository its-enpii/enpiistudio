# Task: AUDIT penuh @its-enpii/ui — style layer & theme conformance

PENTING: Kerjakan dengan reasoning HIGH. Ini audit akhir sebelum rilis — akurasi > kecepatan.

## Konteks
Repo ini adalah monorepo enpiistudio; fokus audit: `packages/ui` (library komponen Vue 3).
Komponen total ±75 (lama + 27 baru dari batch 1-4). Semua komponen wajib:
1. Ter-cover oleh KELIMA style layer: `src/styles/material.css`, `glassmorphism.css`,
   `neumorphism.css`, `neobrutalism.css`, `minimalism.css`.
2. Berfungsi di SEMUA theme (data-theme): classic (light), dark, nord, dracula, solarized,
   gruvbox, rosepine — karena semuanya token `--enpii-*`, audit = pastikan TIDAK ADA hardcoded
   color/limitasi theme di komponen/CSS, dan token yang dipakai memang terdefinisi di semua theme.
3. Typography: TIDAK over-bold. Cap: font-weight ≤500 untuk material/glassmorphism/neumorphism/
   minimalism; ≤600 untuk neobrutalism. Bold hanya boleh untuk heading/label semantik.

## Metode audit (kerjakan SEMUA, jangan sampel)
A. **Coverage per komponen**: untuk SETIAP file `src/components/Enpii*.vue`, ambil root BEM block
   class-nya, lalu grep kelima style layer — komponen yang tidak muncul di salah satu layer = LANGSUNG.
   Output tabel: komponen × 5 layer (✓/✗).
B. **Token audit**: kumpulkan semua `var(--enpii-*)` yang dipakai komponen + styles; validasi tiap
   token terdefinisi di `src/styles/tokens.css` dan di semua theme block `[data-theme=...]`.
   Token hilang di theme tertentu = temuan.
C. **Hardcoded color audit**: grep hex colors (`#fff`, `#000`, `#e0e5ec`, rgba(…), color values)
   di src/components dan src/styles yang TIDAK melalui token — temuan (kecuali pengecualian
   netral hitam/putih untuk light-source neumorphism/neobrutalism sesuai AGENTS.md §2.3).
D. **Typography audit**: grep semua `font-weight:` di src/ — listing per nilai; temuan jika
   >500 di layer non-neobrutalism atau >600 di neobrutalism. Juga cek `class="font-bold"`/inline styles.
E. **Variant audit**: untuk komponen yang punya state (button, input, badge, dll), pastikan
   `:hover`, `:focus-visible`, `:disabled`, dan modifier tone/size ada di base + layer.
F. **Fix**: perbaiki SEMUA temuan langsung di repo (base dulu, lalu layer). Jangan tanya —
   pilih fix paling konsisten dengan pattern existing. JANGAN ubah perilaku/API komponen.
G. **Verify**: `cd packages/ui && npm run check && npm run test && npm run build` — semua HARUS hijau.
H. **Report**: daftar temuan (file:line), apa yang diperbaiki, apa yang sengaja tidak diubah + alasan.
   Commit: `fix(ui): audit — style layer & theme conformance pass` (boleh beberapa commit kecil).

Batasan: JANGAN bump version/CHANGELOG, JANGAN push, JANGAN mengubah logic JS komponen kecuali
bug terbukti, JANGAN menambah dependency.
