# Enpii Studio — Project Overview, Plan, dan Roadmap

---

## 1. Project Overview

### 1.1 Apa Ini

Enpii Studio adalah dev studio yang membangun **25 aplikasi UMKM** (laundry, bengkel, kos, rental, konveksi, toko kelontong, katering, warung/kafe, sales lapangan, sekolah/kursus, BUMDes/koperasi, PPOB, penjahit, servis elektronik, bank sampah, jasa kebersihan, pertanian, peternakan, percetakan, futsal booking, toko bangunan, toko elektronik, toko pakaian, event organizer), masing-masing sebagai produk berdiri sendiri dengan tenant per produk (pemilik-pemilik bisnis di satu produk tidak lintas ke produk lain).

Proyek ini berdiri di atas dua pilar:

- **Daftar target** — 25 ide aplikasi UMKM, masing-masing dengan gambaran masalah yang diselesaikan, fitur utama, dan tech stack rekomendasi. Ini **tujuan akhir**.
- **Fondasi reusable** — arsitektur bersama yang mencakup Core (Identity, Tenancy, Authorization), Communication, dan WhatsApp Gateway berbasis Evolution API. Ini **mesin** yang mempercepat realisasi 25 target tersebut, supaya tiap produk tidak membangun ulang hal yang sama dari nol.

### 1.2 Prinsip Inti

> Fondasi dibangun sekali, dipakai berkali-kali. Setiap dari 25 produk tidak boleh membangun Identity, Tenancy, atau integrasi WhatsApp dari nol.

### 1.3 Bentuk Reusability

| Komponen | Bentuk | Alasan |
|---|---|---|
| Core (Identity, Tenancy, Authorization, Settings, Audit Log) | Composer package, di-*install* per app | Tenant scoped per-produk, tidak perlu jadi service terpusat |
| WhatsApp Client (SDK) | Composer package, di-*install* per app | Tipis, hanya kontrak + HTTP client |
| UI Components | Composer/NPM package, opsional | Konsistensi tampilan lintas produk |
| WhatsApp Gateway (Evolution API) | **Service terpisah**, sudah eksis | Credential sensitif, resource mahal (nomor WA), dipakai bersama oleh semua produk |
| 25 Aplikasi UMKM | Laravel app standalone, masing-masing repo sendiri | Siklus rilis independen, stack berbeda-beda (web/mobile/desktop) |

### 1.4 Struktur Repositori

```text
enpii-studio/core              → package: Identity, Tenancy, Authorization,
                                  Settings, Feature Flags, Audit Log,
                                  Customer Management base
enpii-studio/whatsapp-client   → package: WhatsAppProvider contract + HTTP client
@its-enpii/ui                → package: komponen Vue reusable, design tokens

enpii-whatsapp-gateway         → service terpisah (sudah ada), Evolution API adapter

enpii-laundry                  → app pertama (pilot)
enpii-bengkel                  → app kedua
enpii-kos, enpii-rental, ...   → 23 app lainnya, dibangun menyusul
```

---

## 2. Plan

### 2.1 Non-Goals di Awal

Supaya scope tidak melebar sebelum fondasi terbukti:

- **Tidak** membangun Notification Orchestrator penuh (multi-channel, template management kompleks) di awal — cukup abstraksi tipis ke WhatsApp Gateway.
- **Tidak** membangun Billing & Subscription lintas produk — tiap produk boleh punya billing sederhana sendiri dulu.
- **Tidak** membangun dashboard Platform Admin terpusat — itu kebutuhan setelah beberapa produk jalan, bukan prasyarat produk pertama.
- Rilis pra-1.0 Core dan WhatsApp Client melalui repository distribusi Composer VCS dengan tag immutable; path repository hanya untuk pengembangan monorepo.

### 2.2 Kriteria "Core Siap Dipakai Ulang"

Core dianggap matang untuk di-tag versi 1.0 dan dipakai app kedua jika:

1. Identity + Tenancy + Authorization sudah dipakai produksi di minimal 1 app (pilot).
2. WhatsApp Client berhasil mengirim notifikasi end-to-end dari domain event nyata (bukan test manual).
3. Tidak ada perubahan struktural pada skema Tenancy selama minimal 2–4 minggu berjalan (tanda sudah stabil).

### 2.3 Pemilihan Pilot

**Laundry** atau **Penjahit** dipilih sebagai pilot pertama karena:

- Stack A (Laravel + Vue 3 + Inertia), tanpa Nuxt publik, tanpa mobile wajib — kompleksitas paling rendah.
- Alur bisnis pendek: Customer → Transaksi → Status → Notifikasi selesai — cukup untuk membuktikan pipa penuh tanpa domain logic yang rumit.
- Punya event WhatsApp yang jelas untuk divalidasi ujung-ke-ujung: `LaundryOrderReady` — dipicu saat status pesanan berubah jadi selesai, mengirim notifikasi WhatsApp ke pelanggan.

---

## 3. Roadmap

### Fase 0 — Validasi Infrastruktur (sebelum coding app)
- [ ] Pastikan Evolution API jalan dan minimal 1 instance WA berhasil `connected`.
- [ ] Kirim 1 pesan test manual langsung ke Evolution API (bukan lewat gateway internal) untuk validasi jalur paling dasar.
- [ ] Setup `enpii-infrastructure`: Docker Compose (PostgreSQL, Redis, Nginx) baseline yang bisa dipakai ulang tiap app.

### Fase 1 — Bangun `enpii-studio/core`
- [ ] Init repo, skema migration: Identity (users, roles), Tenancy (scoped per-app), Authorization (permissions).
- [ ] Settings + Feature Flags minimal.
- [ ] Audit Log dasar.
- [ ] **Belum** masukkan Customer Management — tunggu sampai pilot benar-benar membutuhkan agar skemanya tidak dispekulasi di awal.

### Fase 2 — Bangun `enpii-studio/whatsapp-client`
- [ ] Definisikan contract `WhatsAppProvider` dengan method inti: `sendText()`, `sendMedia()`, `getInstanceStatus()`, `connectInstance()`, `disconnectInstance()`.
- [ ] Implementasi HTTP client ke `enpii-whatsapp-gateway` yang sudah eksis.
- [ ] Idempotency key + retry dasar (belum perlu queue kompleks di awal, cukup job sederhana).

### Fase 3 — Pilot: `enpii-laundry`
- [ ] Scaffold Laravel + Vue 3 + Inertia, lalu `composer require` Core dan WhatsApp Client dari repository distribusi VCS.
- [ ] Fitur inti: data pelanggan, pencatatan transaksi, status proses laundry, invoice, notifikasi WhatsApp saat cucian selesai.
- [ ] Domain event `LaundryOrderReady` → WhatsApp Client → Evolution API → validasi delivery log.
- [ ] Deploy pilot ke produksi kecil (real user, bukan cuma staging).

### Fase 4 — Stabilisasi Core
- [ ] Review skema Tenancy/Identity berdasarkan hal-hal yang ternyata kurang saat build pilot.
- [ ] Tag versi `v1.0.0` untuk `enpii-studio/core` dan `enpii-studio/whatsapp-client`.
- [ ] Tulis dokumentasi instalasi package singkat (`composer require enpii-studio/core`).

### Fase 5 — Skala ke Produk Berikutnya
- [ ] Pilih app kedua (kandidat: Bengkel atau Penjahit — masih Stack A, domain mirip pilot).
- [ ] Ukur seberapa cepat app kedua bisa jalan dibanding pilot pertama — ini indikator keberhasilan reusability.
- [ ] Lanjut ke produk dengan Stack B (Nuxt publik: Booking Barbershop, Rental, Katering, dst) setelah pola Stack A stabil.
- [ ] Lanjut ke produk dengan Stack C (Flutter mobile: Distributor/Sales, Pertanian, Peternakan) setelah kebutuhan mobile jadi jelas dari pengalaman nyata, bukan asumsi di awal.

### Fase 6 — Infrastruktur Lintas Produk (opsional, belakangan)
- [ ] Platform Admin dashboard untuk memantau WhatsApp Gateway lintas 25 produk (overview, delivery logs, provider health).
- [ ] `@its-enpii/ui` sebagai package komponen Vue, diekstrak dari pola yang berulang di beberapa produk pertama — bukan didesain di awal secara spekulatif.

---

## 4. Catatan Keputusan (untuk referensi ke depan)

| Keputusan | Alasan |
|---|---|
| Tenant per produk, bukan lintas produk | Menyederhanakan Tenancy jadi bagian dari package, bukan service terpusat |
| WhatsApp Gateway tetap service terpisah | Credential sensitif, resource (nomor WA) mahal untuk diduplikasi 25x |
| Core & WhatsApp Client sebagai Composer package, bukan copy-paste | Perbaikan bug/fitur cukup sekali, tidak perlu di-*port* manual ke 25 codebase |
| Pilot dimulai dari Laundry/Penjahit, bukan produk kompleks | Alur bisnis paling pendek untuk validasi pipa penuh secepat mungkin |
| Customer Management belum masuk Core di Fase 1 | Hindari over-engineering skema sebelum ada kebutuhan nyata dari pilot |

---

*Dokumen ini adalah living document — perbarui roadmap setiap fase selesai, terutama Fase 4 (kriteria Core siap versi 1.0) karena itu titik keputusan paling krusial sebelum skala ke 24 produk sisanya.*
