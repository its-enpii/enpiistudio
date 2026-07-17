# Referensi implementasi aktif Enpii Studio

Dokumen ini menjelaskan kontrak yang benar-benar tersedia di repositori Enpii Studio. Pembacanya adalah pengembang aplikasi produk, maintainer paket, dan operator WhatsApp Gateway. Dokumen ini bukan arsitektur masa depan; arah **Target** berada di [`enpiistudio.md`](enpiistudio.md), sedangkan prosedur lokal berada di [`setup.md`](setup.md).

## Status dan sumber kebenaran

- **Aktif** berarti implementasi tersedia pada kode sumber dan didukung pengujian atau runtime.
- **belum ada** berarti kemampuan tersebut tidak tersedia pada implementasi saat ini.
- **Target** berarti gagasan masa depan yang tidak boleh diperlakukan sebagai kontrak aktif.

Jika sumber bertentangan, gunakan urutan penyelesaian berikut: kode sumber dan runtime, pengujian, migrasi dan penyedia layanan, OpenAPI dan Compose, runbook, lalu dokumen target atau roadmap. OpenAPI menggambarkan kontrak HTTP yang dimaksud, tetapi [perbedaan terhadap runtime](#59-perbedaan-implementasi-dan-openapi-yang-diketahui) tetap dicatat secara terbuka.

Semua tautan memakai jalur relatif repositori tanpa line anchor agar tidak cepat kedaluwarsa.

## Daftar isi

- [1. Peta sistem aktif](#1-peta-sistem-aktif)
- [2. Core](#2-core)
- [3. WhatsApp Client](#3-whatsapp-client)
- [4. UI](#4-ui)
- [5. WhatsApp Gateway](#5-whatsapp-gateway)
- [6. Contoh integrasi aplikasi konsumen](#6-contoh-integrasi-aplikasi-konsumen)
- [7. Konvensi lintas komponen](#7-konvensi-lintas-komponen)
- [8. Troubleshooting](#8-troubleshooting)
- [9. Matriks kemampuan yang belum ada](#9-matriks-kemampuan-yang-belum-ada)

## 1. Peta sistem aktif

```text
Aplikasi produk Laravel
├── enpii-studio/core                 in-process
├── enpii-studio/whatsapp-client      in-process
├── @enpii-studio/ui                  frontend Vue
└── HTTP
    └── Enpii WhatsApp Gateway        layanan jaringan internal
        └── Evolution API             layanan eksternal
```

| Komponen | Tanggung jawab aktif | Tidak bertanggung jawab atas |
| --- | --- | --- |
| Core | Konteks tenant, model identity, authorization, settings, feature flags, audit | Login/MFA, resolver tenant konkret, propagasi queue otomatis |
| WhatsApp Client | Kontrak PHP, validasi DTO, HTTP adapter, fake, command terbatas | Kepemilikan tenant, credential Evolution, auto-connect |
| UI | Token CSS, Button, Badge | State aplikasi dan komponen interaktif |
| WhatsApp Gateway | Auth principal, ACL instance, lifecycle, text send, idempotency, readiness | Domain tenant Core, aplikasi produk, media delivery |
| Evolution API | Koneksi WhatsApp aktual | Kontrak aplikasi produk |

Aplikasi produk **belum ada** di repositori ini. Setiap produk nantinya tetap menjadi modular monolith Laravel standalone dengan database, deployment, dan release cycle sendiri.

## 2. Core

Paket [`enpii-studio/core`](../packages/core) menyediakan fondasi in-process untuk aplikasi Laravel. Laravel package discovery mendaftarkan [`CoreServiceProvider`](../packages/core/src/CoreServiceProvider.php). Provider memasang scoped binding untuk `TenantContext`, `AuthorizationService`, `SettingsRepository`, dan `FeatureFlags`, serta Gate `enpii.permission`. Migrasi tidak dimuat otomatis; aplikasi harus memublikasikannya dengan tag `enpii-core-migrations`.

### 2.1 Tenancy

Folder [`Tenancy`](../packages/core/src/Tenancy) memuat konteks, scope, trait model, kontrak resolver, middleware, model tenant, serta dua exception fail-closed.

#### `TenantContext`

[`TenantContext`](../packages/core/src/Tenancy/TenantContext.php) mempunyai API berikut:

```php
set(string $tenantId): void
id(): string
has(): bool
assertMatches(string $tenantId): void
forget(): void
run(string $tenantId, Closure $callback): mixed
```

`set()` menolak ID tenant kosong. `id()` melempar `TenantContextMissing` bila konteks belum tersedia. `assertMatches()` memakai `hash_equals()` dan melempar `TenantMismatch` saat ID berbeda. `run()` menyimpan konteks sebelumnya, menjalankan callback, lalu memulihkannya di `finally`; pola ini aman untuk pemanggilan bersarang maupun exception.

Kontrak runtime hanya menjamin string non-kosong. Migrasi memakai kolom UUID, sehingga validitas UUID baru ditegakkan saat data mencapai database yang mendukung tipe tersebut.

#### Scope dan lifecycle model

[`TenantScope`](../packages/core/src/Tenancy/Scopes/TenantScope.php) menambahkan kondisi `tenant_id = TenantContext::id()` pada query Eloquent. Trait [`BelongsToTenant`](../packages/core/src/Tenancy/Concerns/BelongsToTenant.php) memasang scope dan menyediakan `tenant()` serta `getTenantColumn()` dengan default `tenant_id`.

Saat `creating`, trait mengisi kolom tenant dari konteks bila nilainya kosong. Nilai eksplisit harus cocok dengan konteks aktif. Trait juga memvalidasi atribut saat `retrieved`, `saving`, `deleting`, dan `replicating`. Nilai asli model ikut diperiksa untuk mencegah pemindahan tenant melalui perubahan atribut. `fresh()` dan `refresh()` memeriksa konteks sebelum membaca ulang model basi.

Batas perlindungan berbeda menurut jalur akses:

| Jalur | Perlindungan aktif |
| --- | --- |
| Query Eloquent biasa | Global scope menambahkan filter tenant |
| Hydration model tanpa scope | Event `retrieved` masih memeriksa tenant |
| Save/delete/replicate/fresh/refresh | Lifecycle assertion menolak model dari tenant lain |
| Bulk update/delete, raw query, query builder | Tidak menjalankan lifecycle model; filter tenant wajib ditulis eksplisit |
| Quiet methods atau `withoutEvents` | Dapat melewati assertion berbasis event |

Tidak ada bypass administrator implisit. Kode lintas tenant harus menjadi operasi administratif yang eksplisit, dibatasi, dan diuji tersendiri.

#### Model dan tabel tenant

[`Tenant`](../packages/core/src/Tenancy/Models/Tenant.php) adalah model final dengan `HasUuids` dan `SoftDeletes`. Model ini tidak tenant-scoped karena mewakili pemilik konteks.

| Kolom `core_tenants` | Kontrak |
| --- | --- |
| `id` | UUID primary key |
| `name` | String |
| `slug` | String unik global |
| `status` | String, default `active` |
| `created_at`, `updated_at` | Timestamp |
| `deleted_at` | Soft delete nullable |

Soft delete tidak memicu foreign key. Hard delete tenant dibatasi oleh foreign key langsung dari users, roles, settings, feature flags, dan audit logs. Permissions bersifat global dan tidak memblokir penghapusan tenant. Pivot memiliki aturan cascade melalui foreign key role/user masing-masing.

#### Resolver pada request

[`TenantResolver`](../packages/core/src/Tenancy/Contracts/TenantResolver.php) hanya mendefinisikan `resolveTenantId(): string`. [`ResolveTenantContext`](../packages/core/src/Tenancy/Middleware/ResolveTenantContext.php) menjalankan request di dalam `TenantContext::run()`.

Aplikasi konsumen harus menyediakan resolver dan alias middleware:

```php
use EnpiiStudio\Core\Tenancy\Contracts\TenantResolver;
use EnpiiStudio\Core\Tenancy\Middleware\ResolveTenantContext;
use Illuminate\Foundation\Configuration\Middleware;

$app->singleton(TenantResolver::class, ProductTenantResolver::class);

$middleware->alias([
    'tenant' => ResolveTenantContext::class,
]);
```

Contoh tersebut adalah kode aplikasi konsumen, bukan class yang disediakan paket. Resolver subdomain, header, session, dan JWT claim dicatat pada [matriks kemampuan yang belum ada](#9-matriks-kemampuan-yang-belum-ada).

#### Konteks pada queue

Queue job harus membawa ID tenant sebagai data serializable dan memasang ulang konteks secara manual:

```php
public function handle(TenantContext $context): void
{
    $context->run($this->tenantId, function (): void {
        // Seluruh query tenant-scoped berada di sini.
    });
}
```

Jangan menyimpan instance model tenant sebagai pengganti ID tanpa mempertimbangkan stale-model checks. Trait atau middleware queue otomatis dicatat pada matriks akhir.

### 2.2 Identity

[`User`](../packages/core/src/Identity/Models/User.php) adalah model autentikasi final yang menggunakan `BelongsToTenant`, `HasUuids`, dan `Notifiable`.

| Aspek | Kontrak aktif |
| --- | --- |
| Tabel | `core_users` |
| Fillable | `name`, `email`, `password`, `status` |
| Hidden | `password`, `remember_token` |
| Cast | `email_verified_at` → datetime; `password` → hashed |
| Relasi | `roles()` melalui `core_role_user` dengan pivot `tenant_id` |
| Helper | `hasRole(string)` dan `hasPermission(string)` |

Karena model final, aplikasi tidak dapat membuat subclass. Data khusus produk sebaiknya ditempatkan pada model profil yang berelasi melalui komposisi. Laravel auth provider harus memakai model Core ini bila Gate `enpii.permission` digunakan:

```php
// config/auth.php
'providers' => [
    'users' => [
        'driver' => 'eloquent',
        'model' => \EnpiiStudio\Core\Identity\Models\User::class,
    ],
],
```

Gate meneruskan authenticated user ke `AuthorizationService::allow(User $user, ...)`. Model auth lain tidak memenuhi type contract dan dapat menghasilkan `TypeError`. Paket tidak menyediakan login, registrasi, password reset, MFA, Sanctum, atau Passport.

Helper `hasRole()` dan `hasPermission()` hanya memeriksa relasi. Keduanya tidak menolak user inactive secara mandiri. Gunakan Gate atau `AuthorizationService::allow()` untuk keputusan akses.

### 2.3 Authorization

Authorization bersifat custom, bukan Spatie Permission. [`Role`](../packages/core/src/Authorization/Models/Role.php) tenant-scoped, sedangkan [`Permission`](../packages/core/src/Authorization/Models/Permission.php) bersifat global.

[`AuthorizationService`](../packages/core/src/Authorization/AuthorizationService.php) menyediakan:

```php
assignRole(User $user, Role $role): void
grantPermission(Role $role, Permission $permission): void
allow(User $user, string $permission): bool
```

`assignRole()` mensyaratkan user dan role sudah tersimpan. Keduanya harus cocok dengan konteks aktif; pivot menyimpan `tenant_id`. `grantPermission()` juga mensyaratkan model tersimpan dan role dari konteks aktif.

`allow()` menjalankan pemeriksaan dengan urutan berikut:

1. User non-`active` langsung ditolak dengan `false`.
2. Slug permission di-trim dan nilai kosong melempar `InvalidArgumentException`.
3. ID tenant user harus cocok dengan konteks.
4. Relasi role-permission menentukan hasil akhir.

Karena status diperiksa lebih dahulu, user inactive dengan slug kosong atau konteks berbeda tetap menghasilkan `false`, bukan validation/mismatch exception.

Provider memasang Gate `enpii.permission`. Pemakaian yang dianjurkan:

```php
$allowed = Gate::forUser($user)
    ->allows('enpii.permission', 'orders.view');
```

Permission tidak mempunyai tenant ID. Isolasi terjadi melalui role tenant-scoped dan composite pivot `core_role_user`. Wildcard permission, super-admin bypass, policy domain, serta CRUD role/permission dicatat pada matriks akhir.

### 2.4 Feature Flags

[`FeatureFlags`](../packages/core/src/FeatureFlags/FeatureFlags.php) membaca dan menulis boolean per tenant:

```php
enabled(string $key): bool
set(string $key, bool $enabled): FeatureFlag
```

Tenant tidak diterima sebagai argumen; model [`FeatureFlag`](../packages/core/src/FeatureFlags/Models/FeatureFlag.php) memperoleh tenant dari `TenantContext`. Key di-trim dan hanya nilai kosong yang ditolak. Paket tidak menetapkan charset, format namespace, normalisasi huruf, atau batas panjang di level service; batas string database tetap berlaku.

```php
$enabled = $context->run($tenantId, function () use ($flags): bool {
    $flags->set('orders.new-flow', true);

    return $flags->enabled('orders.new-flow');
});
```

Key yang tidak ditemukan selalu menghasilkan `false`. `set()` memakai `updateOrCreate()` dan tidak memberikan jaminan concurrency tambahan untuk dua first-write bersamaan. API delete/unset, rollout persentase, cohort, variant, schedule, dan cache tercatat pada matriks akhir.

### 2.5 Settings

[`SettingsRepository`](../packages/core/src/Settings/SettingsRepository.php) menyediakan penyimpanan key-value JSON per tenant:

```php
get(string $key, mixed $default = null): mixed
set(string $key, mixed $value): Setting
```

Key di-trim, harus non-kosong, dan harus mengandung setidaknya satu titik. Implementasi tidak memvalidasi segment kosong, charset, case, schema nilai, atau panjang sebelum database.

```php
$currency = $context->run($tenantId, function () use ($settings): string {
    $settings->set('orders.currency', 'IDR');

    return $settings->get('orders.currency', 'IDR');
});
```

Perbedaan missing key dan nilai `null` tersimpan bersifat penting:

| Kondisi | `get('orders.label', 'fallback')` |
| --- | --- |
| Baris tidak ada | `'fallback'` |
| Baris ada dengan JSON `null` | `null` |
| Baris ada dengan nilai | Nilai yang tersimpan |

`set()` memakai `updateOrCreate()` tanpa concurrency guarantee tambahan. API delete, global settings, typed schema, enkripsi nilai, dan cache tercatat pada matriks akhir.

### 2.6 Audit

[`AuditWriter`](../packages/core/src/Audit/AuditWriter.php) menulis audit secara eksplisit:

```php
record(
    string $action,
    Model $subject,
    array $before = [],
    array $after = [],
    array $metadata = [],
): AuditLog
```

Action harus non-kosong dan subject harus sudah tersimpan. Bila subject memiliki method `getTenantColumn()`, writer memeriksa tenant subject terhadap konteks. Model non-tenant juga diterima dan audit-nya tetap diatribusikan kepada konteks aktif. `subject_type` memakai `getMorphClass()`: morph alias bila terdaftar, FQCN bila tidak.

Actor bersifat opsional melalui [`AuditActorResolver`](../packages/core/src/Audit/Contracts/AuditActorResolver.php). Tanpa binding, `actor_id` bernilai `null` walaupun Laravel Auth memiliki user. ID dari resolver harus ditemukan melalui query `User` dalam scope tenant aktif; status active/inactive tidak diperiksa.

```php
$this->app->bind(AuditActorResolver::class, function () {
    return new class implements AuditActorResolver {
        public function actorId(): ?string
        {
            return auth()->id() === null ? null : (string) auth()->id();
        }
    };
});
```

Writer meredaksi recursive array bila nama key cocok secara case-insensitive dengan allowlist sensitif: `password`, `password_confirmation`, `remember_token`, `token`, `access_token`, `refresh_token`, `secret`, `api_key`, `apikey`, dan `authorization`. Nilainya menjadi `[REDACTED]`. Jaminan ini tidak mencakup objek, JSON string terenkode, atau key lain seperti `client_secret`.

Contoh manual:

```php
app(AuditWriter::class)->record(
    'order.status-changed',
    $order,
    before: ['status' => 'processing'],
    after: ['status' => 'ready'],
    metadata: ['source' => 'operator'],
);
```

Trait [`Auditable`](../packages/core/src/Audit/Concerns/Auditable.php) bersifat opt-in. Model produk harus menambahkan `use Auditable;`. Trait mencatat event `created`, `updated`, dan `deleted`; event `restored` tidak dicatat. Callback berjalan setelah perubahan model, sehingga aplikasi harus membungkus perubahan domain dan audit dalam transaksi bila keduanya harus atomik.

[`AuditLog`](../packages/core/src/Audit/Models/AuditLog.php) menolak event model `updating` dan `deleting`. Ini bukan database immutability: builder bulk, quiet/event-suppressed operations, dan raw SQL dapat melewati perlindungan tersebut.

### 2.7 Skema data Core

Migrasi aktif berada di [`create_enpii_core_tables`](../packages/core/database/migrations/0001_01_01_000000_create_enpii_core_tables.php).

| Tabel | Scope dan kunci | Aturan penghapusan penting |
| --- | --- | --- |
| `core_tenants` | UUID PK; slug unik; soft delete | Hard delete dibatasi FK langsung |
| `core_users` | Tenant; UUID PK; unik `(tenant_id,email)` dan `(id,tenant_id)` | Tenant restrict; pivot role cascade |
| `core_roles` | Tenant; UUID PK; unik `(tenant_id,slug)` dan `(id,tenant_id)` | Tenant restrict; pivots cascade |
| `core_permissions` | Global; UUID PK; slug unik | Tidak bergantung tenant |
| `core_permission_role` | PK `(permission_id,role_id)` | Cascade dari permission/role |
| `core_role_user` | PK `(tenant_id,role_id,user_id)`; composite FK ke role/user | Cascade melalui role/user; tidak memiliki FK tenant langsung |
| `core_settings` | Tenant; UUID PK; unik `(tenant_id,key)`; JSON nullable | Tenant restrict |
| `core_feature_flags` | Tenant; UUID PK; unik `(tenant_id,key)` | Tenant restrict |
| `core_audit_logs` | Tenant; UUID PK; actor composite FK; subject ID string | Tenant/actor restrict; hanya `created_at` |

Composite uniqueness `(id, tenant_id)` hanya tersedia pada users dan roles. Settings, flags, dan audit mengandalkan UUID primary key serta constraint masing-masing; jangan menggeneralisasi composite key ke seluruh tabel tenant.

Pengujian perilaku Core menggunakan Orchestra Testbench dan SQLite in-memory. Suite tersebut membuktikan isolasi tenant, stale-model rejection, Gate dasar, stored-null settings, redaksi audit, dan Eloquent append-only. Ia belum merupakan conformance suite PostgreSQL untuk seluruh perilaku.

## 3. WhatsApp Client

Paket [`enpii-studio/whatsapp-client`](../packages/whatsapp-client) adalah adapter in-process menuju Enpii WhatsApp Gateway. Laravel package discovery mendaftarkan penyedia layanan dan singleton `WhatsAppGateway`; aplikasi produk tidak memanggil Evolution API langsung.

### 3.1 Konfigurasi dan binding

[`config/whatsapp-client.php`](../packages/whatsapp-client/config/whatsapp-client.php) mendefinisikan:

| Variabel lingkungan | Default | Keterangan |
| --- | --- | --- |
| `ENPII_WHATSAPP_GATEWAY_URL` | `http://localhost:8090/api/v1` | Base URL Gateway |
| `ENPII_WHATSAPP_GATEWAY_KEY` | Tidak ada | Bearer token; wajib non-kosong |
| `ENPII_WHATSAPP_GATEWAY_TIMEOUT` | `10` | Total timeout dalam detik |
| `ENPII_WHATSAPP_GATEWAY_CONNECT_TIMEOUT` | `3` | Connect timeout dalam detik |

URL wajib HTTPS, kecuali HTTP pada host loopback tepat `localhost`, `127.0.0.1`, atau `::1`. URL dengan userinfo/password ditolak. Constructor belum memvalidasi bahwa timeout bernilai positif.

[`WhatsAppClientServiceProvider`](../packages/whatsapp-client/src/WhatsAppClientServiceProvider.php) menggabungkan config, lalu mengikat singleton `WhatsAppGateway` ke `HttpWhatsAppGateway`. Config dapat dipublikasikan dengan tag `whatsapp-client-config`. Dua command didaftarkan saat aplikasi berjalan di console.

```php
public function __construct(
    private WhatsAppGateway $whatsApp,
) {}
```

### 3.2 Kontrak

[`WhatsAppGateway`](../packages/whatsapp-client/src/Contracts/WhatsAppGateway.php) menyediakan lima operasi:

```php
sendText(TextMessage $message): SendResult
sendMedia(MediaMessage $message): SendResult
status(string $instanceId): InstanceStatus
connect(string $instanceId): ConnectionResult
disconnect(string $instanceId): InstanceStatus
```

Paket tidak membawa ID atau konteks tenant. `instanceId` adalah nama logis yang dikirim ke Gateway. Gateway menentukan kepemilikan melalui API principal, terpisah dari tenancy Core.

### 3.3 DTO dan status

| DTO | Properti | Validasi aktif |
| --- | --- | --- |
| [`TextMessage`](../packages/whatsapp-client/src/DTOs/TextMessage.php) | `instanceId`, `to`, `text`, `idempotencyKey` | ID 1–100 byte; penerima E.164-like; text 1–4096 byte; key 8–200 karakter `[A-Za-z0-9._:-]` |
| [`MediaMessage`](../packages/whatsapp-client/src/DTOs/MediaMessage.php) | `instanceId`, `to`, `mediaUrl`, `idempotencyKey`, `caption?`, `filename?` | Batas ID/penerima/key sama; URL wajib HTTPS; caption/filename belum divalidasi |
| [`SendResult`](../packages/whatsapp-client/src/DTOs/SendResult.php) | `messageId`, `status` | ID non-kosong; status string `accepted` atau `sent` |
| [`InstanceStatus`](../packages/whatsapp-client/src/DTOs/InstanceStatus.php) | `instanceId`, `GatewayStatus` | Tidak melakukan validasi tambahan; `isConnected()` tersedia |
| [`ConnectionResult`](../packages/whatsapp-client/src/DTOs/ConnectionResult.php) | `instanceId`, `GatewayStatus`, `qrCode?`, `pairingCode?` | Provisioning material nullable |

Validasi panjang pada DTO memakai `strlen()`, sehingga batasnya berbasis byte. Raw HTTP Gateway dan OpenAPI tidak selalu memakai semantik panjang identik; lihat [perbedaan kontrak](#59-perbedaan-implementasi-dan-openapi-yang-diketahui).

[`GatewayStatus`](../packages/whatsapp-client/src/Enums/GatewayStatus.php) memiliki nilai `disconnected`, `connecting`, `connected`, dan `error`. `isConnected()` hanya true untuk `connected`. Status kirim tetap string, bukan enum.

QR code dan pairing code adalah material provisioning sensitif. Jangan log atau simpan nilai tersebut tanpa kebutuhan operasional yang sah.

### 3.4 Error dan retry

[`GatewayException`](../packages/whatsapp-client/src/Exceptions/GatewayException.php) memuat `kind`, `retryable`, `httpStatus`, `gatewayCode`, dan `requestId`.

| `kind` | Pemicu | Data tambahan |
| --- | --- | --- |
| `transport` | `ConnectionException` setelah percobaan habis | `retryable=true`; exception asli sebagai `previous` |
| `response` | Gateway mengembalikan HTTP gagal | Status, code, request ID, dan retryable dari error envelope |
| `protocol` | JSON, field wajib, status, atau instance ID tidak valid | Detail field aman; respons provider mentah tidak diekspos |

Bila error body tidak lengkap, client memakai `HTTP_ERROR`, mengambil request ID dari header `X-Request-ID`, dan menganggap status `>=500` retryable. Respons sukses harus berupa JSON object. Field wajib harus berupa string non-kosong, status harus dikenal, dan `instance_id` harus sama dengan permintaan.

Validasi DTO/config melempar `InvalidArgumentException`. Assertion atau conflict pada fake melempar `RuntimeException`.

| Operasi | Retry otomatis client |
| --- | --- |
| `status`, `connect`, `disconnect` | Tidak ada |
| `sendText`, `sendMedia` | Maksimal dua attempt dengan jeda 100 ms, hanya untuk `ConnectionException` |
| HTTP 4xx/5xx | Tidak diulang otomatis |
| Protocol error | Tidak diulang otomatis |

Setelah kegagalan transport yang ambigu, caller boleh mengulang send dengan idempotency key yang sama. Jangan membuat key baru hanya karena respons tidak diterima; provider mungkin sudah menerima pesan.

```php
try {
    $result = $gateway->sendText($message);
} catch (InvalidArgumentException $exception) {
    // Perbaiki input; jangan retry otomatis.
} catch (GatewayException $exception) {
    logger()->warning('WhatsApp Gateway failed', [
        'kind' => $exception->kind,
        'code' => $exception->gatewayCode,
        'request_id' => $exception->requestId,
        'retryable' => $exception->retryable,
    ]);
}
```

Jangan log API key, recipient lengkap, QR/pairing payload, atau exception `previous` tanpa redaksi.

### 3.5 Fake

[`FakeWhatsAppGateway`](../packages/whatsapp-client/src/Fakes/FakeWhatsAppGateway.php) merekam text/media messages serta instance yang di-connect/disconnect. State status default adalah `Disconnected`; QR default `fake-qr`; pairing code default `null`.

Fake menyediakan `assertConnected()`, `assertDisconnected()`, `assertTextSent()`, `assertMediaSent()`, dan `assertNothingSent()`. Key yang sama dengan payload identik mengembalikan result yang sama. Key sama dengan payload berbeda melempar `RuntimeException`.

Binding test dilakukan manual:

```php
$fake = new FakeWhatsAppGateway;

$this->app->instance(WhatsAppGateway::class, $fake);

// Jalankan subject under test.
$fake->assertTextSent(
    fn (TextMessage $message): bool => $message->instanceId === 'local-instance',
);
```

State status fake bersifat global, bukan per-instance. Fake menerima media dan menghasilkan success future-facing; ini bukan bukti bahwa Gateway runtime mendukung media.

### 3.6 Command

| Command | Perilaku |
| --- | --- |
| `enpii:whatsapp-smoke {instance}` | Memanggil status sekali; tidak connect atau send |
| `enpii:whatsapp-connect {instance} {--show-qr} {--show-pairing}` | Status → connect bila perlu → status; tanpa polling dan tanpa send |

QR/pairing hanya dicetak ketika operator memberi flag eksplisit. Gunakan flag tersebut hanya pada terminal aman. Command mengembalikan exit failure saat Gateway melempar error.

### 3.7 Batas media

`MediaMessage`, `sendMedia()`, dan fake media tersedia sebagai surface persiapan. HTTP client mengirim body serta `Idempotency-Key`, tetapi Gateway aktif mengabaikannya setelah autentikasi dan selalu mengembalikan `501 FEATURE_UNAVAILABLE`. Pada runtime saat ini, `sendMedia()` selalu berakhir sebagai `GatewayException` kind `response` bila request mencapai Gateway.

## 4. UI

Paket [`@enpii-studio/ui`](../packages/ui) adalah library Vue 3 internal dan private. Ia hanya berisi komponen presentasional serta token CSS; state aplikasi tetap milik produk.

### 4.1 Export dan konsumsi

[`src/index.ts`](../packages/ui/src/index.ts) mengekspor `EnpiiButton` dan `EnpiiBadge`, serta mengimpor token CSS. Package export `./styles.css` dan compatibility alias `./tokens.css` menunjuk artifact CSS yang sama; import salah satu saja.

```ts
import { EnpiiBadge, EnpiiButton } from '@enpii-studio/ui'
import '@enpii-studio/ui/styles.css'
```

Peer dependency aktif adalah Vue `^3.5.0`. Package tetap `private`, versi `0.0.0`, dan berlisensi internal `UNLICENSED`.

### 4.2 Komponen

| Komponen | Props | Default | Kontrak elemen |
| --- | --- | --- | --- |
| [`EnpiiButton`](../packages/ui/src/components/EnpiiButton.vue) | `type?: button|submit|reset`, `disabled?: boolean` | `button`, `false` | Native `<button>` dengan slot |
| [`EnpiiBadge`](../packages/ui/src/components/EnpiiBadge.vue) | `tone?: primary|success|warning|danger|neutral`, `pill?: boolean` | `neutral`, `false` | Presentational `<span>` dengan slot |

```vue
<EnpiiButton type="submit" :disabled="saving">
  Simpan
</EnpiiButton>

<EnpiiBadge tone="success" pill>
  Aktif
</EnpiiBadge>
```

Accessible name Button berasal dari slot; icon-only button tetap membutuhkan label yang diberikan aplikasi. Untuk submit form, gunakan `type="submit"` eksplisit. `disabled` memakai perilaku native. CSS menyediakan `:focus-visible` dan penyesuaian forced colors.

Badge tidak mempunyai semantic role khusus. Teks harus menyampaikan status tanpa mengandalkan warna saja.

### 4.3 Token CSS

[`tokens.css`](../packages/ui/src/styles/tokens.css) mendefinisikan custom properties `--enpii-*` untuk warna primary/semantic, focus, radius control, spacing control, dan font stack. Override dilakukan setelah import stylesheet:

```css
@import '@enpii-studio/ui/styles.css';

:root {
  --enpii-color-primary: #1d4ed8;
  --enpii-color-primary-hover: #1e40af;
}
```

Package tidak mengirim konfigurasi Tailwind. Aplikasi boleh memetakan token sendiri. Modal, dropdown, tabs, toast, dismissible chips, menu interaktif, dan komponen stateful lainnya dicatat pada matriks akhir.

## 5. WhatsApp Gateway

[`services/whatsapp-gateway`](../services/whatsapp-gateway) adalah Laravel application terpisah dan satu-satunya network boundary bersama. Gateway menyembunyikan credential Evolution, mengautentikasi principal, membatasi instance, dan menyediakan kontrak `/api/v1`.

### 5.1 Endpoint aktif

| Endpoint | Auth | Input utama | Sukses |
| --- | --- | --- | --- |
| `GET /health` | Publik | — | `200 {status: ok}` |
| `GET /ready` | Publik | — | `200`, atau `503 NOT_READY` |
| `GET /instances/{instanceId}/status` | Bearer | Path instance | `200 InstanceStatus` |
| `POST /instances/{instanceId}/connect` | Bearer | Path instance | `200 ConnectionResult` |
| `POST /instances/{instanceId}/disconnect` | Bearer | Path instance | `200 InstanceStatus` |
| `POST /messages/text` | Bearer | JSON + `Idempotency-Key` | `202 SendResult` |
| `POST /messages/media` | Bearer | Runtime mengabaikan body | `501 FEATURE_UNAVAILABLE` |

Semua endpoint terlindungi memakai rate limit default 60 permintaan per menit per principal. Endpoint health/readiness berada di luar auth dan throttle group.

### 5.2 Autentikasi dan ACL

Bearer token berbentuk `<key_id>.<secret>`. Middleware mencari principal dengan `key_id` dan status persis `active`, lalu memverifikasi secret menggunakan `password_verify()`. Database hanya menyimpan `key_hash`.

Provisioning dilakukan melalui:

```bash
php artisan gateway:principal-create PRODUCT_NAME \
  --instance=INSTANCE_NAME
```

Command dapat menerima nol atau lebih option `--instance`, membuat principal, lalu menampilkan API key sekali. Instance name unik secara global dan dimiliki satu principal. Instance tidak ada menghasilkan `404 INSTANCE_NOT_FOUND`; instance milik principal lain menghasilkan `403 INSTANCE_FORBIDDEN`.

Rotasi/revocation command, management API, serta reassignment instance tercatat pada matriks akhir. Mengubah kolom status principal secara administratif menjadi selain `active` membuat autentikasi gagal.

### 5.3 Lifecycle dan status

Status provider dipetakan ke status kanonis:

| Evolution state | Gateway status |
| --- | --- |
| `open`, `connected` | `connected` |
| `connecting`, `qr_required` | `connecting` |
| `close`, `disconnected` | `disconnected` |
| Lainnya | `error` |

Status endpoint meminta state provider dan menyimpannya pada `gateway_instances.status`. Connect dan disconnect memakai Redis/cache lock per UUID instance selama 15 detik. Lock contention menghasilkan `409 INSTANCE_BUSY` dengan `retryable=true`.

Connect HTTP adapter selalu mengembalikan status awal `connecting`, beserta QR/pairing nullable. Gateway tidak polling tanpa batas, tidak auto-connect sebelum send, dan tidak menjalankan lifecycle secara otomatis.

### 5.4 Health dan readiness

`/health` hanya membuktikan proses merespons. `/ready` menjalankan query database serta cache write/read. Ia tidak memeriksa Evolution API. Karena itu readiness dapat hijau ketika provider WhatsApp sedang gagal. Compose healthcheck memakai `/health`, bukan `/ready`.

### 5.5 Idempotency pengiriman teks

[`IdempotencyService`](../services/whatsapp-gateway/src/Services/IdempotencyService.php) mewajibkan key 8–200 karakter dengan pola `[A-Za-z0-9._:-]`. Scope record adalah `principal_id + operation + SHA-256(key)`; request hash adalah SHA-256 dari JSON payload tervalidasi dalam urutan field runtime.

| Kondisi record | Hasil |
| --- | --- |
| Tidak ada | Buat `processing`, jalankan send, simpan response |
| Key sama, payload sama, `completed` | Replay response lama dengan HTTP `202` |
| Key sama, payload sama, `failed` | Replay error code/status/message/retryable lama dengan request ID baru |
| Key sama, payload sama, `processing` | `409 REQUEST_IN_PROGRESS`, retryable |
| Key sama, payload berbeda | `409 IDEMPOTENCY_CONFLICT`, non-retryable |

Record diberi `expires_at = now + 7 hari`, tetapi lookup tidak mengabaikan record kedaluwarsa. Expiry efektif bergantung pada command `gateway:idempotency-purge`, yang dijadwalkan harian hanya bila scheduler Laravel berjalan. Compose tidak menyediakan scheduler. Selain itu, successful record direferensikan delivery melalui `restrictOnDelete`; purge dapat gagal menghapus record tersebut. Karena itu jangan mengklaim retensi tujuh hari sebagai TTL efektif saat ini.

Gateway menyimpan satu delivery dengan provider message ID, recipient masked, HMAC recipient menggunakan `APP_KEY`, status, dan `attempts=1`. Bila provider send berhasil tetapi persistence delivery gagal, Gateway mengembalikan `500 DELIVERY_PERSISTENCE_FAILED` dan memperingatkan caller agar tidak retry memakai key baru.

### 5.6 Request ID dan error envelope

Middleware membuat UUID baru untuk setiap request dan mengirimkannya melalui `X-Request-ID`. Incoming correlation ID tidak dipertahankan. Error body selalu berbentuk:

```json
{
  "code": "ERROR_CODE",
  "message": "Safe message",
  "request_id": "generated-uuid",
  "retryable": false
}
```

Client membaca `request_id` dari body, lalu memakai header sebagai fallback. Simpan request ID pada log aplikasi untuk korelasi dukungan, tanpa menyertakan secret atau payload sensitif.

| Code | HTTP | Retryable | Arti/tindakan caller |
| --- | ---: | --- | --- |
| `UNAUTHENTICATED` | 401 | false | Credential hilang/tidak valid/principal inactive; perbaiki credential |
| `INSTANCE_FORBIDDEN` | 403 | false | Instance milik principal lain; jangan retry |
| `INSTANCE_NOT_FOUND` | 404 | false | Provision instance atau perbaiki nama |
| `INSTANCE_BUSY` | 409 | true | Lifecycle lock sedang dipakai; retry terbatas |
| `IDEMPOTENCY_CONFLICT` | 409 | false | Key telah dipakai payload lain; perbaiki pemetaan bisnis |
| `REQUEST_IN_PROGRESS` | 409 | true | Request pertama belum selesai; retry key/payload yang sama |
| `INVALID_INSTANCE` | 422 | false | Identifier ditolak provider adapter |
| `INVALID_IDEMPOTENCY_KEY` | 422 | false | Perbaiki header key |
| `VALIDATION_FAILED` | 422 | false | Perbaiki JSON body |
| `FEATURE_UNAVAILABLE` | 501 | false | Media delivery belum tersedia |
| `PROVIDER_PROTOCOL_ERROR` | 502 | true | Respons Evolution tidak valid; inspeksi provider |
| `PROVIDER_UNAVAILABLE` | 503 | true | Evolution gagal/timeout; retry terkontrol |
| `NOT_READY` | 503 | true | DB/cache belum siap |
| `DELIVERY_PERSISTENCE_FAILED` | 500 | false | Send mungkin sudah terjadi; jangan gunakan key baru |
| `INTERNAL_ERROR` | 500 | true atau persisted false | Error tak terduga; gunakan request ID |
| `NOT_FOUND` / `HTTP_ERROR` | Sesuai HTTP | false | Error HTTP generik, termasuk route/throttle saat ini |

Field `retryable` adalah petunjuk, bukan perintah retry otomatis. Caller tetap harus memakai backoff, batas percobaan, serta idempotency key yang sama pada send ambigu.

### 5.7 Penyimpanan dan konfigurasi

| Tabel | Isi utama |
| --- | --- |
| `gateway_api_principals` | UUID, nama, key ID unik, password hash, status |
| `gateway_instances` | UUID, principal, nama unik, encrypted provider token, status |
| `gateway_idempotency_keys` | Scope/hash/status/response/HTTP status/expiry |
| `gateway_message_deliveries` | Instance, idempotency, provider ID, masked/HMAC recipient, status/attempts |

Gateway memakai PostgreSQL untuk persistence dan Redis cache untuk readiness, lifecycle lock, serta rate limiting. `APP_KEY` harus stabil karena melindungi encrypted cast `provider_token` dan menjadi HMAC key recipient.

Provider mendukung driver `http` dan `fake`. HTTP driver memerlukan Evolution URL HTTPS (HTTP hanya exact loopback), API key, dan timeout default 10 detik. Provider HTTP failure menjadi `503 PROVIDER_UNAVAILABLE`; malformed response menjadi `502 PROVIDER_PROTOCOL_ERROR`; keduanya retryable.

Compose membangun service `whatsapp-gateway` secara lokal. Container menjalankan migrasi lalu Artisan development server. Ia membuka port PostgreSQL, Redis, dan Gateway ke host; tidak menyediakan TLS, reverse proxy, scheduler, queue worker, atau production process manager. Detail standalone dan Compose ada di [`setup.md`](setup.md).

### 5.8 Contoh wire aman dengan fake driver

Contoh ini hanya untuk stack lokal dengan `EVOLUTION_API_DRIVER=fake`. Jangan menjalankannya terhadap provider nyata tanpa persetujuan eksplisit.

```bash
BASE_URL=http://127.0.0.1:8090/api/v1
API_KEY='KEY_ID.SECRET_PLACEHOLDER'
INSTANCE='local-instance'
KEY='order.demo.0001'

curl "$BASE_URL/health"
curl "$BASE_URL/ready"
curl -H "Authorization: Bearer $API_KEY" \
  "$BASE_URL/instances/$INSTANCE/status"

curl -X POST -H "Authorization: Bearer $API_KEY" \
  "$BASE_URL/instances/$INSTANCE/connect"

curl -X POST \
  -H "Authorization: Bearer $API_KEY" \
  -H "Idempotency-Key: $KEY" \
  -H "Content-Type: application/json" \
  -d '{"instance_id":"local-instance","to":"+628000000000","text":"Pesan uji fake"}' \
  "$BASE_URL/messages/text"
```

Mengulang body dan key yang sama menghasilkan replay stabil. Mengubah text dengan key sama menghasilkan `409 IDEMPOTENCY_CONFLICT`. Recipient di atas hanya placeholder dokumentasi dan tidak boleh dipakai untuk send nyata.

### 5.9 Perbedaan implementasi dan OpenAPI yang diketahui

[`openapi.yaml`](../contracts/whatsapp-gateway/openapi.yaml) adalah kontrak HTTP yang dimaksud, tetapi runtime belum sepenuhnya conform:

- Runtime menambahkan `X-Request-ID`; OpenAPI belum mendeklarasikan header tersebut.
- Throttle berlaku pada semua route terlindungi, sedangkan OpenAPI hanya mendeklarasikan `429` pada text send.
- Error runtime `500`, `502`, `503`, dan beberapa `422` dapat muncul pada endpoint yang daftar response OpenAPI-nya lebih sempit.
- Client mengirim body dan idempotency header pada media; OpenAPI media tidak mendeklarasikannya, sedangkan runtime mengabaikannya dan mengembalikan `501`.
- OpenAPI mencantumkan `403` untuk media, tetapi controller media tidak melakukan ACL lookup setelah auth.
- CI hanya menjalankan lint OpenAPI dan pengujian runtime secara terpisah. Generated conformance test **belum ada**.

Saat terjadi drift, kode sumber dan pengujian menjelaskan perilaku teramati; OpenAPI tetap menunjukkan kontrak yang perlu diselaraskan.

## 6. Contoh integrasi aplikasi konsumen

Tidak ada skeleton aplikasi produk. Potongan berikut menunjukkan tanggung jawab aplikasi konsumen, bukan file yang disediakan paket.

### 6.1 Instalasi dan request tenancy

Tambahkan repository Composer VCS dan require tag rilis kedua paket seperti dijelaskan di [`setup.md`](setup.md). Path repositories hanya untuk pengembangan monorepo. Publikasikan migrasi Core, lalu konfigurasikan Laravel auth agar memakai model `EnpiiStudio\Core\Identity\Models\User`.

Implementasikan `ProductTenantResolver`, bind ke `TenantResolver`, lalu pasang `ResolveTenantContext` pada route tenant. Resolver harus mengautentikasi sumber tenant; jangan mempercayai header bebas tanpa authorization.

```php
Route::middleware(['auth', 'tenant'])->group(function (): void {
    Route::get('/orders', function (
        SettingsRepository $settings,
        FeatureFlags $flags,
    ) {
        return [
            'currency' => $settings->get('orders.currency', 'IDR'),
            'new_flow' => $flags->enabled('orders.new-flow'),
        ];
    });
});
```

### 6.2 Authorization dan audit

```php
abort_unless(
    Gate::allows('enpii.permission', 'orders.update'),
    403,
);

DB::transaction(function () use ($order): void {
    $before = ['status' => $order->status];
    $order->update(['status' => 'ready']);

    app(AuditWriter::class)->record(
        'order.status-changed',
        $order,
        before: $before,
        after: ['status' => 'ready'],
    );
});
```

Transaksi diperlukan bila perubahan domain dan audit harus berhasil atau gagal sebagai satu unit.

### 6.3 Pengiriman text

Gunakan idempotency key stabil yang diturunkan dari operasi bisnis, bukan random key setiap attempt:

```php
$message = new TextMessage(
    instanceId: 'product-instance',
    to: $recipient,
    text: 'Pesanan siap diambil.',
    idempotencyKey: 'order.notification.'.$order->getKey(),
);

try {
    $result = $gateway->sendText($message);
} catch (GatewayException $exception) {
    report($exception);

    // Queue retry hanya bila kebijakan aplikasi menerima
    // $exception->retryable, dengan idempotency key yang sama.
    throw $exception;
}
```

Connect harus tetap tindakan operator eksplisit. Jangan memanggil `connect()` otomatis di jalur send.

### 6.4 UI

```ts
import { EnpiiBadge, EnpiiButton } from '@enpii-studio/ui'
import '@enpii-studio/ui/styles.css'
```

Komponen dapat digunakan langsung di Vue template setelah registrasi/import sesuai setup aplikasi.

## 7. Konvensi lintas komponen

- Setiap produk adalah modular monolith standalone dengan satu Laravel application, database, deployment, dan release cycle.
- Core dan WhatsApp Client adalah paket Composer in-process. UI adalah paket npm internal. Hanya Gateway menjadi dependensi jaringan bersama.
- Tabel Core memakai prefix `core_`; tabel Gateway memakai `gateway_`.
- Primary key model domain Core dan Gateway memakai UUID. `TenantContext` sendiri hanya memvalidasi string non-kosong.
- `instanceId` adalah nama logis string, bukan UUID database instance.
- Audit subject ID dan provider message ID disimpan sebagai string karena berasal dari boundary berbeda.
- Idempotency key mengidentifikasi operasi bisnis; ia bukan primary key domain dan harus stabil saat retry.
- Migrasi Core dimiliki aplikasi konsumen setelah publish. Migrasi Gateway auto-loaded oleh service provider. Upgrade harus menambah migrasi baru, bukan mengubah migrasi yang telah dijalankan.
- Credential live, recipient, QR/pairing payload, provider token, dan respons Evolution mentah tidak boleh disimpan di source, fixture, log, atau dokumentasi.

## 8. Troubleshooting

| Gejala | Penyebab umum | Tindakan aman |
| --- | --- | --- |
| `TenantContextMissing` | Middleware/resolver tidak berjalan atau query di luar `run()` | Pasang context pada request/job; jangan memberi fallback tenant global |
| `TenantMismatch` | Model basi atau ID tenant eksplisit berbeda | Buang model lama dan query ulang di konteks benar |
| `Target [TenantResolver] is not instantiable` | Binding resolver aplikasi belum ada | Bind implementasi consumer dan pasang middleware alias |
| Tabel `core_*` tidak ditemukan | Migrasi Core belum dipublikasikan/dijalankan | Periksa destination, publish, lalu migrate |
| Gate menghasilkan `TypeError` | Auth provider memakai model selain Core `User` | Perbaiki `config/auth.php` atau jangan gunakan Gate Core |
| `401 UNAUTHENTICATED` | Token salah, kosong, atau principal inactive | Provision/rotate credential secara aman; jangan log secret |
| `403 INSTANCE_FORBIDDEN` | Principal tidak memiliki instance | Perbaiki ACL/provisioning; jangan retry |
| `404 INSTANCE_NOT_FOUND` | Nama instance belum dibuat/salah | Provision atau perbaiki identifier |
| `409 INSTANCE_BUSY` | Lifecycle lock aktif | Retry terbatas dengan backoff |
| `409 REQUEST_IN_PROGRESS` | Send pertama masih berjalan | Ulangi key dan payload yang sama setelah jeda |
| `409 IDEMPOTENCY_CONFLICT` | Key dipakai payload berbeda | Perbaiki derivasi key; jangan menimpa record |
| `422 VALIDATION_FAILED` | JSON text send tidak valid | Perbaiki field berdasarkan kontrak DTO/API |
| `422 INVALID_IDEMPOTENCY_KEY` | Header hilang/format salah | Gunakan 8–200 karakter aman |
| `429 HTTP_ERROR` | Rate limit protected route | Backoff; kurangi frekuensi; gunakan request ID |
| `501 FEATURE_UNAVAILABLE` | Media endpoint belum diterapkan | Gunakan text atau tunda fitur media |
| `502 PROVIDER_PROTOCOL_ERROR` | Respons Evolution tidak sesuai | Inspeksi versi/provider tanpa log secret |
| `503 PROVIDER_UNAVAILABLE` | Evolution tidak terjangkau | Retry terkontrol dengan key sama untuk send |
| `503 NOT_READY` | DB/cache gagal | Periksa PostgreSQL/Redis; jangan kirim trafik |
| Health hijau, provider gagal | Health/readiness tidak memeriksa Evolution | Uji status instance secara terautentikasi |
| Idempotency rows tidak terhapus | Scheduler tidak berjalan atau FK delivery restrict | Jalankan scheduler; periksa purge dan FK sebelum cleanup |
| Encrypted token gagal dibaca | `APP_KEY` berubah | Pulihkan key lama; jangan generate ulang pada deployment |
| Client `protocol` | JSON/field/status/instance mismatch | Gunakan request ID; selaraskan Gateway/client contract |

## 9. Matriks kemampuan yang belum ada

Matriks ini adalah daftar kanonis tunggal. Bagian lain menjelaskan perilaku aktif tanpa mengulang daftar absen.

| Area | Kemampuan **belum ada** | Pengganti saat ini | Tambahkan ketika |
| --- | --- | --- | --- |
| Tenancy | Resolver subdomain/header/session/JWT bawaan | Consumer implements `TenantResolver` | Pola resolver stabil lintas produk |
| Tenancy | Queue middleware/`TenantAwareJob` otomatis | Job membawa ID dan memakai `TenantContext::run()` | Queue dipakai berulang lintas produk |
| Identity | Login/register/reset/MFA/API auth | Aplikasi menyusun auth sendiri dengan Core `User` | Product auth requirements disepakati |
| Identity | Model User extensible | Composition melalui profile model | Kebutuhan field lintas produk terbukti |
| Authorization | Wildcard, super-admin, policies, CRUD UI/API | Permission exact + Gate custom | Kebutuhan operasional nyata muncul |
| Feature Flags | Rollout/cohort/variant/schedule/cache/delete API | Boolean tenant key | Boolean sederhana tidak cukup |
| Settings | Global setting, typed schema, encryption, cache/delete API | JSON key-value per tenant | Data sensitif/volume/schema menuntutnya |
| Audit | DB trigger, hash chain, outbox, restore audit | Eloquent writer/trait opt-in | Compliance/durability membutuhkan boundary DB |
| WhatsApp Client | `SendStatus` enum, facade/helper, fake auto-binding | String status + DI/manual fake | API client perlu ergonomi tambahan |
| WhatsApp Client | Validasi caption/filename formal | Hanya HTTPS media URL | Media delivery mulai dirancang |
| UI | Modal/dropdown/tabs/toast/menu dan komponen stateful | Button, Badge, tokens | Pola UI berulang pada produk nyata |
| Gateway | Media delivery SSRF-safe | Endpoint `501 FEATURE_UNAVAILABLE` | Fetch policy/storage/scanning siap |
| Gateway | Credential rotation/revocation/reassignment management | Provision command + administrasi DB terbatas | Operasi multi-produk membutuhkan lifecycle key |
| Gateway | OpenAPI conformance/generated SDK/rendered docs | Lint OpenAPI + tests terpisah | Contract drift harus dicegah otomatis |
| Gateway | Scheduler/worker/reverse proxy/TLS/production deployment | Compose lokal + Artisan server | Menjelang deployment production |
| Product | Skeleton dan aplikasi contoh | Dokumentasi consumer manual | Produk pertama mulai dibangun |
| IDs | ULID/auto-increment convention | UUID domain, string boundary IDs | Ada kebutuhan terukur untuk mengganti |

## Indeks sumber utama

- Core: [`src`](../packages/core/src), [`migration`](../packages/core/database/migrations/0001_01_01_000000_create_enpii_core_tables.php), [`tests`](../packages/core/tests).
- WhatsApp Client: [`src`](../packages/whatsapp-client/src), [`config`](../packages/whatsapp-client/config/whatsapp-client.php), [`tests`](../packages/whatsapp-client/tests).
- UI: [`README`](../packages/ui/README.md), [`src`](../packages/ui/src), [`tests`](../packages/ui/tests).
- Gateway: [`routes`](../services/whatsapp-gateway/routes/api.php), [`src`](../services/whatsapp-gateway/src), [`migration`](../services/whatsapp-gateway/database/migrations/0001_01_01_000000_create_gateway_tables.php), [`tests`](../services/whatsapp-gateway/tests).
- HTTP contract: [`openapi.yaml`](../contracts/whatsapp-gateway/openapi.yaml).
- Operasi lokal: [`setup.md`](setup.md).
