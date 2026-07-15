# Pembaruan Fondasi Reusable Enpii Studio

## Integrasi WhatsApp Gateway dengan Evolution API

Enpii Studio telah memiliki sistem WhatsApp Gateway berbasis **Evolution API**. Gateway ini ditempatkan sebagai layanan komunikasi bersama yang dapat digunakan oleh seluruh produk SaaS dan aplikasi tenant.

```text
Enpii Studio Platform
├── Platform Admin
├── Tenant Application
├── Tenant Provisioning
├── Subscription & Billing
├── Support Desk
├── Notification Orchestrator
└── Communication Gateway
    └── WhatsApp Gateway
        └── Evolution API
```

WhatsApp Gateway tidak hanya menjadi fitur tambahan pada aplikasi tertentu, tetapi menjadi bagian dari infrastruktur reusable Enpii Studio.

---

# Arsitektur yang Direkomendasikan

```text
Public Website
└── Nuxt
    ├── Landing page
    ├── Pricing
    ├── Registrasi tenant
    ├── Dokumentasi
    └── Status layanan

Laravel Modular Monolith
├── Platform Admin
├── Tenant Application
├── Tenant Provisioning
├── Subscription
├── Billing
├── Support Desk
├── Notification Orchestrator
├── REST API
└── Background Workers
        │
        ▼
Enpii WhatsApp Gateway
        │
        ▼
Evolution API

Frontend Internal
├── Platform Admin: Vue 3 + Inertia.js
└── Tenant Admin: Vue 3 + Inertia.js

Data dan Infrastruktur
├── PostgreSQL
├── Redis
├── S3-compatible object storage
├── Docker Compose
└── Nginx
```

Prinsip utamanya:

> Modul bisnis tidak boleh memanggil Evolution API secara langsung. Semua pesan dikirim melalui Notification Orchestrator dan WhatsApp Gateway internal Enpii Studio.

---

# Pembaruan Standar Tech Stack

## Stack A — Sistem Operasional Internal

```text
Backend          : Laravel
Admin dashboard  : Vue 3 + Inertia.js
Database         : PostgreSQL
Queue/cache      : Redis
UI               : Tailwind CSS
File storage     : S3-compatible storage
WhatsApp         : Enpii WhatsApp Gateway + Evolution API
Deployment       : Docker Compose + Nginx
```

Cocok untuk:

* laundry
* bengkel
* penjahit
* servis elektronik
* konveksi
* percetakan
* koperasi
* administrasi sekolah

## Stack B — SaaS dengan Website Publik

```text
Backend API      : Laravel
Public frontend  : Nuxt
Admin dashboard  : Vue 3 + Inertia.js
Database         : PostgreSQL
Queue/cache      : Redis
File storage     : S3-compatible storage
WhatsApp         : Enpii WhatsApp Gateway + Evolution API
Deployment       : Docker Compose + Nginx
```

Cocok untuk:

* booking barbershop
* rental
* lapangan olahraga
* katering
* portal pelanggan
* katalog produk
* jasa kebersihan

## Stack C — Sistem dengan Mobile App

```text
Backend API       : Laravel
Admin dashboard   : Vue 3 + Inertia.js
Mobile            : Flutter
Database server   : PostgreSQL
Database lokal    : SQLite
Queue/cache       : Redis
Push notification : Firebase Cloud Messaging
WhatsApp          : Enpii WhatsApp Gateway + Evolution API
File storage      : S3-compatible storage
```

Cocok untuk:

* distributor dan sales lapangan
* kurir laundry
* pertanian
* peternakan
* teknisi lapangan
* petugas kebersihan

## Stack D — Kasir Desktop atau Offline

```text
Cloud backend     : Laravel REST API
Desktop           : Tauri + Vue
Database lokal    : SQLite
Database cloud    : PostgreSQL
Synchronization   : Background synchronization
Queue/cache       : Redis
WhatsApp          : Enpii WhatsApp Gateway + Evolution API
```

---

# Notification Orchestrator

Notification Orchestrator menjadi penghubung antara event bisnis dan channel komunikasi.

```text
Domain Event
    │
    ▼
Notification Orchestrator
    ├── WhatsApp
    ├── Email
    ├── Push notification
    └── In-app notification
```

Notification Orchestrator bertanggung jawab menentukan:

* pesan yang harus dikirim
* penerima
* channel
* template
* prioritas
* jadwal pengiriman
* fallback channel
* status pengiriman

Contoh event platform:

```text
TenantRegistered
TenantProvisioningCompleted
TrialEnding
BillingInvoiceIssued
BillingInvoicePastDue
PaymentReceived
SubscriptionSuspended
SupportTicketReplied
```

Contoh event operasional tenant:

```text
LaundryOrderReady
BookingConfirmed
ServiceOrderCompleted
RentReturnReminder
KosInvoiceIssued
SchoolPaymentDue
```

Modul bisnis cukup menerbitkan event. Modul bisnis tidak perlu mengetahui detail pengiriman WhatsApp.

---

# Abstraction WhatsApp Provider

Gunakan kontrak provider agar aplikasi tidak bergantung langsung pada Evolution API.

```php
interface WhatsAppProvider
{
    public function sendText(
        WhatsAppTextMessage $message
    ): WhatsAppSendResult;

    public function sendMedia(
        WhatsAppMediaMessage $message
    ): WhatsAppSendResult;

    public function getInstanceStatus(
        string $instanceId
    ): WhatsAppInstanceStatus;

    public function connectInstance(
        string $instanceId
    ): WhatsAppConnectionResult;

    public function disconnectInstance(
        string $instanceId
    ): void;
}
```

Implementasi pertama:

```text
WhatsAppProvider
└── EvolutionApiProvider
```

Keuntungan pendekatan ini:

* Evolution API dapat diganti tanpa mengubah modul bisnis
* provider lain dapat ditambahkan
* testing dapat memakai fake provider
* error dari provider dinormalisasi
* credential dan endpoint dikelola terpusat

---

# Pemisahan Pesan Platform dan Pesan Tenant

## Pesan Platform

Pesan dari Enpii Studio kepada owner atau administrator tenant.

```text
Enpii Studio
→ Owner tenant
```

Contoh:

* verifikasi pendaftaran
* welcome message
* trial akan berakhir
* invoice langganan diterbitkan
* tagihan jatuh tempo
* pembayaran berhasil
* tenant masuk masa tenggang
* pengumuman maintenance
* balasan support

## Pesan Tenant

Pesan dari tenant kepada pelanggan mereka.

```text
Tenant
→ Pelanggan tenant
```

Contoh:

* cucian telah selesai
* booking dikonfirmasi
* kendaraan selesai diservis
* barang rental harus dikembalikan
* tagihan kos
* pesanan katering
* pengingat pembayaran kursus

Kedua jenis pesan harus memiliki:

* instance atau sender yang berbeda
* kuota berbeda
* template berbeda
* delivery log berbeda
* feature flag berbeda
* kebijakan retry berbeda

---

# Model Instance WhatsApp

## Shared Platform Instance

Digunakan untuk pesan Enpii Studio kepada tenant.

```text
Enpii Studio Shared Instance
→ Semua tenant
```

Digunakan untuk:

* onboarding
* billing
* support
* announcement
* maintenance
* incident notification

## Dedicated Tenant Instance

Setiap tenant menghubungkan nomor WhatsApp bisnis sendiri.

```text
Tenant A → Instance A
Tenant B → Instance B
Tenant C → Instance C
```

Digunakan untuk komunikasi operasional tenant kepada pelanggan mereka.

## Model Hybrid

Model yang direkomendasikan:

```text
Pesan platform
→ Shared Enpii Studio instance

Pesan operasional tenant
→ Dedicated tenant instance
```

Dedicated instance dapat dijadikan fitur paket Business atau Premium.

---

# Struktur Data WhatsApp

## WhatsApp Instances

```text
whatsapp_instances
- id
- tenant_id nullable
- provider
- instance_key
- display_name
- phone_number
- status
- connection_state
- credential_reference
- connected_at
- disconnected_at
- last_seen_at
- created_at
- updated_at
```

`tenant_id` bernilai kosong jika instance tersebut milik platform Enpii Studio.

Status instance:

```text
provisioning
qr_required
connecting
connected
disconnected
disabled
error
```

## Message Templates

```text
message_templates
- id
- tenant_id nullable
- code
- channel
- name
- content
- variables
- status
- created_at
- updated_at
```

Contoh kode template:

```text
platform.tenant_registered
platform.trial_ending
platform.invoice_issued
platform.invoice_past_due
platform.payment_received
platform.ticket_replied

tenant.laundry_order_ready
tenant.booking_confirmed
tenant.service_completed
tenant.rental_return_reminder
tenant.payment_due
```

## Message Deliveries

```text
message_deliveries
- id
- tenant_id nullable
- instance_id
- channel
- recipient
- template_code nullable
- provider
- provider_message_id nullable
- idempotency_key
- status
- attempts
- error_code nullable
- error_message nullable
- queued_at
- sent_at nullable
- delivered_at nullable
- read_at nullable
- failed_at nullable
- created_at
- updated_at
```

Status pengiriman:

```text
queued
processing
sent
delivered
read
failed
cancelled
```

## Webhook Events

```text
whatsapp_webhook_events
- id
- provider
- provider_event_id nullable
- instance_id nullable
- event_type
- payload
- signature_valid
- processing_status
- received_at
- processed_at nullable
- error_message nullable
```

Raw payload webhook disimpan agar dapat digunakan untuk debugging dan replay.

---

# Queue, Retry, dan Idempotency

Pesan tidak boleh dikirim dalam request utama.

```text
Request pengguna
→ Simpan transaksi
→ Commit database
→ Publish event
→ Queue notification
→ WhatsApp Gateway
→ Evolution API
```

Setiap job pengiriman memiliki:

* timeout
* retry maksimal
* exponential backoff
* idempotency key
* failed job handling
* structured logging

Contoh idempotency key:

```text
platform-invoice-issued:{invoice_id}:{recipient}
laundry-order-ready:{tenant_id}:{order_id}:{recipient}
booking-reminder:{tenant_id}:{booking_id}:{scheduled_at}
```

Tambahkan unique constraint:

```sql
UNIQUE (channel, idempotency_key)
```

Dengan begitu, retry tidak mengirim pesan yang sama secara berulang.

---

# Integrasi Pendaftaran Tenant

```text
Registrasi tenant
→ Verifikasi email
→ Verifikasi nomor WhatsApp
→ Tenant dibuat
→ User owner dibuat
→ Trial dibuat
→ Provisioning dijalankan
→ Welcome message dikirim
→ Onboarding dimulai
```

Welcome message dapat berisi:

* nama bisnis
* alamat login
* durasi trial
* langkah onboarding
* dokumentasi
* kanal bantuan

Verifikasi WhatsApp dapat dibuat opsional pada registrasi awal dan diwajibkan sebelum tenant menggunakan fitur tertentu.

---

# Integrasi Billing

Event billing yang mendukung notifikasi WhatsApp:

```text
BillingInvoiceIssued
BillingInvoiceDueSoon
BillingInvoicePastDue
PaymentReceived
PaymentFailed
SubscriptionActivated
SubscriptionSuspended
```

Contoh alur:

```text
Invoice diterbitkan
→ Kirim WhatsApp dan email

H-3 jatuh tempo
→ Kirim reminder

Invoice melewati jatuh tempo
→ Ubah status menjadi past_due
→ Tampilkan banner
→ Kirim reminder

Pembayaran berhasil
→ Invoice menjadi paid
→ Subscription diperpanjang
→ Kirim konfirmasi
```

Invoice SaaS tetap dipisahkan dari invoice bisnis tenant:

```text
billing_invoices
billing_invoice_items
billing_payments
payment_attempts
payment_webhook_events
```

---

# Integrasi Support Desk

## Tahap MVP

```text
Tenant membuat tiket
→ Admin menerima notifikasi

Admin membalas tiket
→ Tenant menerima notifikasi WhatsApp
→ Tenant membuka dashboard
→ Tenant membaca dan membalas tiket
```

Pada tahap ini, WhatsApp hanya menjadi kanal notifikasi.

## Tahap Lanjut

```text
Pesan WhatsApp masuk
→ Evolution API webhook
→ Conversation resolver
→ Tiket dibuat atau diperbarui
→ Admin membalas dari dashboard
→ Balasan dikirim melalui gateway
```

Struktur tambahan:

```text
support_conversations
- id
- tenant_id
- channel
- external_contact
- active_ticket_id
- last_message_at
```

```text
support_channel_messages
- id
- conversation_id
- direction
- sender_reference
- content
- provider_message_id
- delivery_status
- created_at
```

Internal note support tidak boleh ikut dikirim ke WhatsApp.

---

# Feature Flags WhatsApp

```text
whatsapp_enabled
whatsapp_shared_sender
whatsapp_dedicated_instance
whatsapp_custom_template
whatsapp_media_message
whatsapp_bulk_message
whatsapp_monthly_limit
whatsapp_instance_limit
```

## Contoh Paket Starter

```text
- Notifikasi dasar
- Kuota pesan rendah
- Template standar
- Tidak memiliki dedicated instance
```

## Contoh Paket Business

```text
- Dedicated WhatsApp instance
- Custom template
- Kuota lebih tinggi
- Delivery tracking
```

## Contoh Paket Premium

```text
- Beberapa instance
- Kuota lebih besar
- Media message
- Automasi lanjutan
- Prioritas queue
```

Usage disimpan dalam:

```text
tenant_usage_counters
- tenant_id
- metric
- period
- value
```

Contoh metric:

```text
whatsapp_messages_sent
whatsapp_messages_failed
whatsapp_media_sent
whatsapp_instances_active
```

---

# Integrasi dengan Produk UMKM

## Laundry

* pesanan diterima
* status pengerjaan berubah
* cucian selesai
* kurir menuju lokasi
* pembayaran belum selesai

## Bengkel

* kendaraan diterima
* estimasi biaya tersedia
* permintaan persetujuan perbaikan
* servis selesai
* pengingat servis berikutnya

## Barbershop atau Salon

* booking dikonfirmasi
* pengingat jadwal
* perubahan jadwal
* pembatalan

## Kos dan Kontrakan

* tagihan diterbitkan
* pengingat jatuh tempo
* pembayaran diterima
* pembaruan keluhan

## Rental

* booking dikonfirmasi
* pengingat pengambilan
* pengingat pengembalian
* pemberitahuan keterlambatan

## Konveksi dan Percetakan

* pesanan diterima
* desain membutuhkan persetujuan
* produksi dimulai
* pesanan selesai

## Distributor

* pesanan diterima
* pengiriman dijadwalkan
* piutang jatuh tempo
* pembayaran diterima

## Sekolah atau Kursus

* pengumuman
* absensi
* tagihan
* pengingat pembayaran
* perubahan jadwal

## Koperasi dan BUMDes

* pengajuan diterima
* pengajuan disetujui atau ditolak
* cicilan jatuh tempo
* pembayaran tercatat

## Servis Elektronik

* perangkat diterima
* estimasi tersedia
* perbaikan selesai
* masa garansi hampir berakhir

---

# Dashboard Platform Admin

Tambahkan modul WhatsApp pada platform admin.

```text
Platform Admin
└── WhatsApp
    ├── Overview
    ├── Instance Management
    ├── Delivery Logs
    ├── Failed Messages
    ├── Message Templates
    ├── Usage
    ├── Webhook Events
    └── Provider Health
```

Metrik utama:

* jumlah instance connected
* jumlah instance disconnected
* pesan terkirim hari ini
* delivery rate
* failure rate
* queue backlog
* webhook gagal
* tenant mendekati kuota

Aksi administratif:

* connect
* tampilkan QR
* refresh status
* disconnect
* reconnect
* test message
* disable instance
* retry failed message
* replay webhook

Semua aksi harus masuk audit log.

---

# Dashboard Tenant

```text
Tenant Settings
└── WhatsApp
    ├── Status instance
    ├── Nomor terhubung
    ├── Connect atau reconnect
    ├── QR code
    ├── Test message
    ├── Message templates
    ├── Monthly usage
    └── Delivery history
```

Tenant tidak boleh melihat:

* API key Evolution API
* credential internal gateway
* instance tenant lain
* konfigurasi platform

---

# Keamanan

Credential Evolution API harus:

* disimpan terenkripsi
* tidak ditampilkan penuh
* tidak dimasukkan ke application log
* tidak dikirim ke frontend
* dipisahkan berdasarkan environment
* dapat dirotasi
* diakses menggunakan least privilege

Contoh masking:

```text
API key      : ************A91F
Nomor tujuan : 62812****789
```

Webhook harus:

* diverifikasi
* dicatat
* diproses melalui queue
* idempotent
* dapat di-replay secara terbatas

---

# Fondasi Reusable Enpii Studio

```text
Enpii Studio Core
├── Identity
├── Tenancy
├── User Membership
├── Authorization
├── Branch Management
├── Settings
├── Feature Flags
├── Customer Management
├── Product & Service Management
├── Inventory
├── Transactions
├── Invoices
├── Booking
├── Workflow
├── Billing & Subscription
├── Payment Integration
├── Support Desk
├── Knowledge Base
├── Audit Log
├── Activity Timeline
├── Reporting
├── File Management
├── Queue & Scheduler
├── Cache
├── Backup & Restore
├── Monitoring
└── Communication
    ├── Notification Orchestrator
    ├── Template Management
    ├── Recipient Resolver
    ├── Delivery Logs
    ├── Usage Metering
    ├── Retry & Idempotency
    ├── Email Provider
    ├── Push Provider
    └── WhatsApp
        ├── Evolution API Adapter
        ├── Instance Management
        ├── QR & Connection Management
        ├── Message Delivery
        ├── Webhook Processing
        ├── Incoming Message Processing
        └── Provider Health Monitoring
```

---

# Struktur Modul Laravel

```text
app/
├── Core/
│   ├── Identity/
│   ├── Tenancy/
│   ├── Authorization/
│   ├── Settings/
│   ├── Audit/
│   └── Infrastructure/
│
├── Platform/
│   ├── TenantRegistry/
│   ├── Provisioning/
│   ├── Subscription/
│   ├── Billing/
│   ├── Support/
│   ├── Announcement/
│   └── Operations/
│
├── Communication/
│   ├── Notifications/
│   ├── Templates/
│   ├── Deliveries/
│   ├── WhatsApp/
│   │   ├── Contracts/
│   │   ├── DTOs/
│   │   ├── Providers/
│   │   ├── Jobs/
│   │   ├── Events/
│   │   └── Webhooks/
│   ├── Email/
│   └── Push/
│
├── Modules/
│   ├── Customers/
│   ├── Products/
│   ├── Inventory/
│   ├── Transactions/
│   ├── Booking/
│   ├── Workflow/
│   ├── Payments/
│   └── Reporting/
│
└── Shared/
    ├── Contracts/
    ├── DTOs/
    ├── Enums/
    ├── Exceptions/
    └── Support/
```

---

# Repositori Enpii Studio

```text
enpii-core-web
- Laravel
- Vue 3
- Inertia.js
- reusable tenant dashboard

enpii-api-core
- Laravel REST API
- authentication
- tenancy
- billing
- support
- notification contracts

enpii-mobile-core
- Flutter
- authentication
- local storage
- synchronization
- notification handling

enpii-whatsapp-gateway
- Evolution API adapter
- instance management
- message delivery
- delivery logs
- webhook processing
- provider monitoring

enpii-infrastructure
- Docker Compose
- Nginx
- PostgreSQL
- Redis
- object storage
- backup
- monitoring

enpii-ui
- reusable Vue components
- design tokens
- form components
- data tables
- notification UI
```

WhatsApp Gateway sebaiknya tetap berupa repository atau service terpisah karena:

* digunakan oleh banyak aplikasi
* memiliki deployment lifecycle tersendiri
* credential lebih sensitif
* webhook dapat diproses terpisah
* service dapat diskalakan secara mandiri

---

# Tahapan Implementasi

## Tahap 1 — Integrasi Dasar

```text
- WhatsApp provider abstraction
- Pengiriman text message
- Queue
- Retry
- Idempotency
- Delivery log
- Shared platform instance
- Billing notification
- Support notification
```

## Tahap 2 — Tenant Instance

```text
- Dedicated instance per tenant
- QR management
- Connection status
- Test message
- Usage limit
- Tenant message templates
- Feature flags
```

## Tahap 3 — Automasi Operasional

```text
- Domain event integration
- Scheduled reminders
- Template variables
- Delivery webhook
- Failure dashboard
- Provider health monitoring
```

## Tahap 4 — Two-Way Support

```text
- Incoming message webhook
- Conversation resolver
- Ticket creation
- Dashboard inbox
- Agent reply
- Message threading
```

Prioritaskan outbound notification, retry, dan delivery tracking sebelum membangun inbox WhatsApp dua arah.

---

# Kesimpulan

Dengan WhatsApp Gateway berbasis Evolution API, Enpii Studio memiliki dua fondasi utama:

```text
Reusable Application Core
+
Reusable Communication Infrastructure
```

Positioning produk dapat diperkuat menjadi:

> Enpii Studio menyediakan sistem operasional berbasis web dan mobile yang terintegrasi dengan automasi komunikasi WhatsApp untuk onboarding, billing, support, transaksi, pengingat, dan pembaruan status.

Stack utama:

```text
Laravel modular monolith
Vue 3 + Inertia.js
Nuxt untuk sisi publik
Flutter untuk mobile
PostgreSQL
Redis
Enpii WhatsApp Gateway
Evolution API
```

Evolution API tetap berada di belakang gateway internal. Seluruh modul bisnis menggunakan event dan Notification Orchestrator untuk mengirimkan pesan secara aman dan konsisten.
