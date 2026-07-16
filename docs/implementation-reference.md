# Enpii Studio — Referensi Implementasi Aktif

Dokumen ini merinci kontrak aktif pada monorepo `enpii-studio`. Ia
bukan target arsitektur — target arsitektur hidup di
[`docs/enpiistudio.md`](enpiistudio.md), roadmap hidup di
[`docs/enpii-studio-roadmap.md`](enpii-studio-roadmap.md), dan
prosedur operasional lokal di [`docs/setup.md`](setup.md).

## Label status

Setiap kemampuan memakai label agar pembaca tidak keliru antara
implementasi aktif dan target:

- **Aktif** — kode atau kontrak ada di repository dan dipakai oleh
  test atau runtime aktif.
- **belum ada** — kemampuan tersebut sengaja tidak dibuat; konsumen
  paket harus merancang atau menambahkannya sendiri.
- **Target** — kemampuan tersebut ada di dokumen target tetapi
  belum diimplementasikan.

Tiap pernyataan di sini mengikuti hierarki sumber:

1. Source `packages/`, `services/`, `contracts/`.
2. Test `packages/core/tests`, `services/whatsapp-gateway/tests`.
3. Migration dan service provider.
4. Compose dan OpenAPI.
5. Dokumen operasional `docs/setup.md`.
6. Dokumen target `docs/enpiistudio.md` dan roadmap.

## Cara membaca path

Semua path repo-relative. Contoh `[TenantContext.php](../packages/core/src/Tenancy/TenantContext.php)`
mengacu ke paket internal. Path tidak disertai line anchor agar
tetap valid saat source berubah.

---

## 1. `enpii-studio/core` — Tenancy (Aktif)

### 1.1 Inventaris `packages/core/src/Tenancy/`

```
Tenancy/
├── TenantContext.php
├── Concerns/
│   └── BelongsToTenant.php
├── Contracts/
│   └── TenantResolver.php
├── Exceptions/
│   ├── TenantContextMissing.php
│   └── TenantMismatch.php
├── Middleware/
│   └── ResolveTenantContext.php
├── Models/
│   └── Tenant.php
└── Scopes/
    └── TenantScope.php
```

### 1.2 `TenantContext`

API publik ([`TenantContext.php`](../packages/core/src/Tenancy/TenantContext.php)):

```php
public function set(string $tenantId): void
public function id(): string
public function has(): bool
public function assertMatches(string $tenantId): void
public function forget(): void
public function run(string $tenantId, Closure $callback): mixed
```

Aturan:

- `set()` kosong → `TenantContextMissing`.
- `id()` tanpa konteks → `TenantContextMissing`.
- `assertMatches()` memakai `hash_equals` (timing-safe).
- `run()` menyimpan konteks sebelumnya dan memulihkannya di
  `finally`.

### 1.3 `TenantScope`

[`TenantScope.php`](../packages/core/src/Tenancy/Scopes/TenantScope.php)
menyuntikkan `where tenant_id = context->id()` ke seluruh
`Builder`. Scope ini terpasang otomatis lewat trait
`BelongsToTenant`.

### 1.4 Trait `BelongsToTenant`

[`BelongsToTenant.php`](../packages/core/src/Tenancy/Concerns/BelongsToTenant.php)
melakukan:

- Memasang global `TenantScope`.
- Saat `creating`: bila kolom tenant kosong, otomatis diisi
  `context->id()`; bila tidak kosong, divalidasi dengan
  `assertMatches`.
- Validasi tenant saat `retrieved`, `saving`, `deleting`,
  `replicating`, dan `original != null` agar model basi dari tenant
  lain tidak lolos diam-diam.
- Override `fresh()` dan `refresh()` memvalidasi konteks dulu.
- Default `getTenantColumn(): 'tenant_id'`.
- `tenant()` untuk relasi ke `Tenant`.

### 1.5 Model `Tenant`

[`Tenant.php`](../packages/core/src/Tenancy/Models/Tenant.php):

- final Eloquent model.
- `HasUuids`.
- `SoftDeletes`.
- Tabel `core_tenants`.
- Fillable: `name`, `slug`, `status`.
- Model `Tenant` sendiri tidak tenant-scoped.

### 1.6 Resolver dan middleware

[`TenantResolver.php`](../packages/core/src/Tenancy/Contracts/TenantResolver.php)
kontrak:

```php
interface TenantResolver
{
    public function resolveTenantId(): string;
}
```

[`ResolveTenantContext.php`](../packages/core/src/Tenancy/Middleware/ResolveTenantContext.php)
middleware:

```php
return $this->context->run(
    $this->resolver->resolveTenantId(),
    fn () => $next($request),
);
```

`CoreServiceProvider`
([`register`](../packages/core/src/CoreServiceProvider.php)) tidak
mendaftarkan alias middleware atau binding default untuk
`TenantResolver`.

### 1.7 Item yang belum ada (Tenancy)

- **belum ada** — concrete resolver subdomain bawaan.
- **belum ada** — concrete resolver header bawaan.
- **belum ada** — concrete resolver session bawaan.
- **belum ada** — concrete resolver JWT claim bawaan.
- **belum ada** — middleware resolver yang terpasang otomatis;
  konsumen paket harus memilih implementasi `TenantResolver`,
  binding ke container, dan mendaftarkan alias middleware
  sendiri.
- **belum ada** — `TenantAwareJob` atau job middleware untuk
  propagasi konteks ke queue.
- **belum ada** — integrasi otomatis broadcast/event listener.

Penyebaran konteks di queue saat ini **manual**:

```php
public function handle(): void
{
    app(TenantContext::class)->run(
        $this->tenantId,
        fn () => /* kerja job */
    );
}
```

### 1.8 Struktur tabel `core_tenants`

Migration aktif
[`0001_01_01_000000_create_enpii_core_tables.php`](../packages/core/database/migrations/0001_01_01_000000_create_enpii_core_tables.php):

| Kolom      | Tipe                                         |
| ---------- | -------------------------------------------- |
| `id`       | UUID primary                                 |
| `name`     | string                                       |
| `slug`     | string unik                                  |
| `status`   | string, default `active`                     |
| timestamps | `created_at`, `updated_at`                   |
| soft delete| `deleted_at`                                 |

Foreign key tenant: `restrictOnDelete()` untuk semua tabel
tenant-owned. Tenant tidak dapat dihapus sebelum audit,
permissions, roles, users, settings, feature flags terkait
disingkirkan.

### 1.9 Batas kemampuan Tenancy

- Tenant context adalah string UUID; tidak ada integer atau ULID.
- Model `Tenant` tidak tenant-scoped (self-reference aman karena
  ia adalah pemilik).
- Tidak ada caching, Redis, atau event-driven broadcasting untuk
  `TenantContext`; setiap request/queue/job mempertahankan
  konteksnya sendiri.
- Raw query atau `withoutGlobalScopes` dilewati; tidak ada
  helper tersembunyi untuk mengakses data lintas tenant.

---

## 2. `enpii-studio/core` — Identity, Authorization, Feature Flags, Settings, Audit (Aktif)

### 2.1 Identity

[`User.php`](../packages/core/src/Identity/Models/User.php):

- final, extends `Illuminate\Foundation\Auth\User`.
- `BelongsToTenant`, `HasUuids`, `Notifiable`.
- Tabel `core_users`.
- Fillable: `name`, `email`, `password`, `status`.
- Hidden: `password`, `remember_token`.
- Casts: `email_verified_at` datetime, `password` hashed.
- Relasi: `roles()` lewat `core_role_user` dengan `tenant_id`
  pivot.

Karena `User` dideklarasikan `final`, pewarisan langsung tidak
tersedia. Kustomisasi product-side dapat memakai komposisi (model
profil tambahan), `Auth::loginUsingId()` + `User::class` saat
otorisasi, atau perubahan kontrak model di masa depan
(**belum ada**).

Helper:

```php
$user->hasRole('manager');
$user->hasPermission('orders.view');
```

**belum ada** — endpoint login, register, reset, MFA, maupun
otentikasi API/Sanctum/Passport.

### 2.2 Authorization

[`AuthorizationService.php`](../packages/core/src/Authorization/AuthorizationService.php):

```php
public function assignRole(User $user, Role $role): void
public function grantPermission(Role $role, Permission $permission): void
public function allow(User $user, string $permission): bool
```

Model:

- [`Role.php`](../packages/core/src/Authorization/Models/Role.php)
  tenant-scoped (`BelongsToTenant`), UUID, fillable `name` dan
  `slug`.
- [`Permission.php`](../packages/core/src/Authorization/Models/Permission.php)
  global (tanpa trait `BelongsToTenant`), UUID.

Karakter:

- Bukan Spatie Permission; custom dengan tabel pivot
  `core_permission_role`.
- Role tenant-scoped, permission global.
- `assignRole()` mensyaratkan user dan role sudah tersimpan
  (`exists`), memvalidasi tenant ID keduanya, dan menyimpan
  `tenant_id` pada pivot.
- `grantPermission()` mensyaratkan role dan permission sudah
  tersimpan, memvalidasi tenant role.
- `allow()` memvalidasi tenant user dan menolak user non-`active`.
- Gate aktif:

```php
Gate::define('enpii.permission',
    fn ($user, string $permission) =>
        app(AuthorizationService::class)->allow($user, $permission));
```

Penggunaan:

```php
Gate::forUser($user)->allows('enpii.permission', 'orders.view');
```

**belum ada** — policy kelas per domain, CRUD role/permission UI
atau API, wildcard permission, super-admin bypass, audit akses
gagal, atau direktori permission tambahan (timpa via service
provider).

### 2.3 Feature Flags

[`FeatureFlags.php`](../packages/core/src/FeatureFlags/FeatureFlags.php):

```php
public function enabled(string $key): bool
public function set(string $key, bool $enabled): FeatureFlag
```

Aturan:

- Key kosong → `InvalidArgumentException`.
- Missing key bernilai `false` (bukan null).
- Tenant implisit dari `TenantContext`; metode tidak menerima
  parameter tenant.

Contoh:

```php
$context->run($tenantId, function () use ($flags): void {
    $flags->set('whatsapp.dedicated-instance', true);
});

$enabled = $context->run(
    $tenantId,
    fn () => $flags->enabled('whatsapp.dedicated-instance'),
);
```

**belum ada** — percentage rollout, cohort, variant, jadwal
aktif/nonaktif, cache, atau UI pengelolaan.

### 2.4 Settings

[`SettingsRepository.php`](../packages/core/src/Settings/SettingsRepository.php):

```php
public function get(string $key, mixed $default = null): mixed
public function set(string $key, mixed $value): Setting
```

Aturan:

- Key kosong atau tanpa `.` → `InvalidArgumentException`.
- Nilai disimpan JSON (`Setting::value` cast ke `json`).
- Stored `null` berbeda dari missing key: `get()` tanpa argumen
  kedua memakai default hanya bila baris tidak ada; bila baris
  ada dengan `value = null`, kembalian `null`.

Contoh:

```php
$context->run($tenantId, function () use ($settings): void {
    $settings->set('orders.currency', 'IDR');
});

$currency = $context->run(
    $tenantId,
    fn () => $settings->get('orders.currency', 'IDR'),
);
```

**belum ada** — global settings, schema typed, enkripsi nilai,
cache, atau UI pengelolaan.

### 2.5 Audit

[`AuditWriter.php`](../packages/core/src/Audit/AuditWriter.php):

```php
public function record(
    string $action,
    Model $subject,
    array $before = [],
    array $after = [],
    array $metadata = [],
): AuditLog
```

Aturan:

- Action kosong → `InvalidArgumentException`.
- Subject harus `exists` dan `getKey()` non-null.
- Subjek tenant-scoped divalidasi dengan `context->id()`.
- Actor opsional lewat
  [`AuditActorResolver`](../packages/core/src/Audit/Contracts/AuditActorResolver.php);
  bila di-binding, actor harus ada di tenant aktif.
- Redaksi rekursif untuk kunci: `password`,
  `password_confirmation`, `remember_token`, `token`,
  `access_token`, `refresh_token`, `secret`, `api_key`, `apikey`,
  `authorization`. Nilai digantikan literal `[REDACTED]`.

[`AuditLog.php`](../packages/core/src/Audit/Models/AuditLog.php):

- `BelongsToTenant`, `HasUuids`.
- Tabel `core_audit_logs`.
- `updating`/`deleting` melempar `LogicException` untuk
  append-only enforcement.
- Tabel telah `updated_at = null`; hanya `created_at`.

Trait
[`Auditable.php`](../packages/core/src/Audit/Concerns/Auditable.php)
mencatat otomatis:

- `created` → `after = getAttributes()`.
- `updated` → `before = getOriginal`, `after = getChanges`.
- `deleted` → `before = getOriginal`.

Contoh aplikasi manual:

```php
app(AuditWriter::class)->record(
    'order.status-changed',
    $order,
    before: ['status' => 'processing'],
    after: ['status' => 'ready'],
    metadata: ['source' => 'operator'],
);
```

**belum ada** — DB trigger, enkripsi append-only, hash chain
kriptografis, maupun pencegah akses raw SQL ke baris audit.

### 2.6 Tabel ringkas Core

| Tabel                  | Tenant-scoped | Catatan                                       |
| ---------------------- | ------------- | --------------------------------------------- |
| `core_tenants`         | Tidak         | UUID, soft delete, slug unik                  |
| `core_users`           | Ya            | UUID, unik per `(tenant_id, email)`           |
| `core_roles`           | Ya            | UUID, unik per `(tenant_id, slug)`            |
| `core_permissions`     | Tidak         | UUID, slug unik global                        |
| `core_permission_role` | Tidak         | Pivot global permission ↔ role                |
| `core_role_user`       | Ya            | Composite FK `(role, tenant)` dan `(user, tenant)` |
| `core_settings`        | Ya            | UUID, JSON value, unik per `(tenant_id, key)` |
| `core_feature_flags`   | Ya            | UUID, boolean, unik per `(tenant_id, key)`    |
| `core_audit_logs`      | Ya            | UUID, append-only Eloquent                    |

Setiap tabel tenant-scoped memiliki `restrictOnDelete()` ke
`core_tenants` agar audit/riwayat tidak hilang saat tenant
dihapus paksa.

---

## 3. `enpii-studio/whatsapp-client` (Aktif)

### 3.1 Kontrak

[`WhatsAppGateway.php`](../packages/whatsapp-client/src/Contracts/WhatsAppGateway.php):

```php
public function sendText(TextMessage $message): SendResult;
public function sendMedia(MediaMessage $message): SendResult;
public function status(string $instanceId): InstanceStatus;
public function connect(string $instanceId): ConnectionResult;
public function disconnect(string $instanceId): InstanceStatus;
```

Kontrak ini adalah satu-satunya cara aplikasi produk berinteraksi
dengan Evolution API; semua rahasia Evolution isolasi di belakang
Gateway.

### 3.2 DTOs

- [`TextMessage`](../packages/whatsapp-client/src/DTOs/TextMessage.php)
  - `string $instanceId` (1–100 byte).
  - `string $to` (E.164-like `^\+?[1-9]\d{7,14}$`).
  - `string $text` (1–4096 byte; trim tidak boleh kosong).
  - `string $idempotencyKey` (8–200, regex
    `^[A-Za-z0-9._:-]+$`).
- [`MediaMessage`](../packages/whatsapp-client/src/DTOs/MediaMessage.php)
  - `string $instanceId`, `string $to`, `string $idempotencyKey`
    sama dengan `TextMessage`.
  - `string $mediaUrl` (wajib HTTPS melalui
    `filter_var + parse_url`).
  - `?string $caption`, `?string $filename`.
  - Caption/filename tanpa validasi (placeholder, **belum ada**
    batasan formal).
- [`SendResult`](../packages/whatsapp-client/src/DTOs/SendResult.php)
  - `string $messageId`, `string $status` ∈
    `accepted|sent`. Tidak ada enum; status adalah string.

> Tenant ID/konteks tenant **belum ada** di dalam paket
> `whatsapp-client`. Identitas pemilik hanya diketahui dari
> `instanceId` yang pemilihan instance-nya dilakukan Gateway
> berdasarkan API principal; paket tidak membawa tenant.

- [`InstanceStatus`](../packages/whatsapp-client/src/DTOs/InstanceStatus.php)
  - `string $instanceId`, `GatewayStatus $status`.
  - `isConnected()` mengembalikan true hanya bila status `connected`.
- [`ConnectionResult`](../packages/whatsapp-client/src/DTOs/ConnectionResult.php)
  - `string $instanceId`, `GatewayStatus $status`.
  - `?string $qrCode`, `?string $pairingCode` (null-aman).

### 3.3 Enum `GatewayStatus`

[`GatewayStatus.php`](../packages/whatsapp-client/src/Enums/GatewayStatus.php):

```php
enum GatewayStatus: string
{
    case Disconnected = 'disconnected';
    case Connecting = 'connecting';
    case Connected = 'connected';
    case Error = 'error';
}
```

`isConnected()` true hanya untuk `Connected`. Status `SendResult`
masih string (`accepted|sent`), bukan enum — **belum ada** enum
status kirim.

### 3.4 Exceptions

[`GatewayException.php`](../packages/whatsapp-client/src/Exceptions/GatewayException.php):

- Field: `string $kind`, `bool $retryable`, `?int $httpStatus`,
  `?string $gatewayCode`, `?string $requestId`.
- `kind`: `transport`, `response`, `protocol`.
- Factory: `transport(Throwable)`, `response(int, ?string,
  ?string, bool)`, `protocol(string, ?Throwable)`.
- DTO/config validation melempar
  `InvalidArgumentException`.
- Fake expectation/idempotency conflict melempar
  `RuntimeException`.
- `GatewayException::getMessage()` aman; response mentah dari
  provider tidak pernah diekspos.

Batas tangkap di sisi konsumen:

- Tangkap `GatewayException` untuk semua kesalahan protokol ke
  Gateway.
- Tangkap `InvalidArgumentException` saat membangun DTO.
- Tangkap `RuntimeException` dari `FakeWhatsAppGateway` hanya di
  test.

### 3.5 Fake

[`FakeWhatsAppGateway.php`](../packages/whatsapp-client/src/Fakes/FakeWhatsAppGateway.php):

- State publik:
  - `array $textMessages`,
    `array $mediaMessages`,
    `array $connectedInstances`,
    `array $disconnectedInstances`.
  - `GatewayStatus $instanceStatus`
    (default `Disconnected`).
  - `?string $qrCode` (default `'fake-qr'`),
    `?string $pairingCode` (default `null`).
- Idempotency internal: key sama dengan payload yang sama → replay
  identik; payload berbeda pada key yang sama → `RuntimeException`.
- Assertions: `assertConnected`, `assertDisconnected`,
  `assertTextSent(Closure)`, `assertMediaSent(Closure)`,
  `assertNothingSent()`.

Binding manual default (contoh):

```php
$fake = new \EnpiiStudio\WhatsAppClient\Fakes\FakeWhatsAppGateway;

$this->app->instance(
    \EnpiiStudio\WhatsAppClient\Contracts\WhatsAppGateway::class,
    $fake,
);
```

**belum ada** — provider atau hook yang otomatis menukar
`WhatsAppGateway` dengan `FakeWhatsAppGateway` di test
environment (Testbench/app instance harus di-binding manual).
State fake global, bukan per-instance.

### 3.6 Commands

- [`GatewayConnectCommand`](../packages/whatsapp-client/src/Commands/GatewayConnectCommand.php):
  - Signature:
    `enpii:whatsapp-connect {instance} {--show-qr} {--show-pairing}`.
  - Urutan: status → (jika belum connected) connect → status.
  - QR/pairing hanya dicetak bila flag eksplisit diset.
  - Tidak ada `send`; tidak ada polling tanpa batas.
- [`GatewaySmokeCommand`](../packages/whatsapp-client/src/Commands/GatewaySmokeCommand.php):
  - Signature: `enpii:whatsapp-smoke {instance}`.
  - Hanya memanggil `status`; status valid apa pun sudah
    menandakan Gateway terjangkau.
  - Tangkap eksplisit `GatewayException` lalu `Throwable` umum.

### 3.7 Service Provider

[`WhatsAppClientServiceProvider.php`](../packages/whatsapp-client/src/WhatsAppClientServiceProvider.php):

- `mergeConfigFrom(__DIR__.'/../config/whatsapp-client.php', 'whatsapp-client')`.
- `singleton(WhatsAppGateway::class, fn ($app) => new HttpWhatsAppGateway(
    http: $app->make(Factory::class),
    baseUrl: (string) $app['config']->get('whatsapp-client.url'),
    apiKey: (string) $app['config']->get('whatsapp-client.api_key'),
    timeout: (int) $app['config']->get('whatsapp-client.timeout'),
    connectTimeout: (int) $app['config']->get('whatsapp-client.connect_timeout'),
))`.
- Tag publish: `whatsapp-client-config` (copy
  `config/whatsapp-client.php` ke `config_path('whatsapp-client.php')`).
- `commands([GatewayConnectCommand::class, GatewaySmokeCommand::class])`
  hanya pada console.

Pemecahan `WhatsAppGateway` lewat DI:

```php
$gateway = app(\EnpiiStudio\WhatsAppClient\Contracts\WhatsAppGateway::class);
$result = $gateway->status('demo');
```

**belum ada** — facade, presensi helper `enpii_whatsapp()`,
resolver berbasis tenant, hook otomatis provider untuk fake.

### 3.8 `HttpWhatsAppGateway`

[`HttpWhatsAppGateway.php`](../packages/whatsapp-client/src/Http/HttpWhatsAppGateway.php)
menggunakan Laravel HTTP Client (`Factory`) dengan bearer token.
Tanggung jawabnya:

- Validasi instance ID sebelum request.
- Menyusun request body JSON untuk endpoint Gateway.
- Mengonversi `Response` gagal menjadi `GatewayException` dengan
  kind `response` atau `protocol`.
- Tangkap `Throwable` jaringan menjadi `GatewayException` dengan
  kind `transport`.
- `mediaUrl` harus HTTPS — bila tidak, `InvalidArgumentException`
  dilempar sebelum HTTP call.

---

## 4. Konvensi project

### 4.1 Produk aplikasi (skeleton)

**belum ada** — aplikasi produk belum ada di repository ini.
Tujuan akhir adalah tiap produk menjadi modular monolith Laravel
standalone yang menambahkan:

- `enpii-studio/core` (path repository Composer) sebagai syarat
  wajib.
- `enpii-studio/whatsapp-client` bila produk memerlukan
  WhatsApp.
- `@enpii-studio/ui` bila produk memerlukan UI Vue bersama.
- Koneksi HTTP ke Gateway internal bila produk memerlukan
  pengiriman pesan.

Testbench lokal di root (`testbench.yaml`) saat ini hanya memuat
`CoreServiceProvider` dan `WhatsAppClientServiceProvider`.

### 4.2 Migrasi dan tenant ID

- Migrasi Core dipublikasikan dengan tag
  `enpii-core-migrations`; tidak auto-load.
- Migrasi Gateway
  ([`0001_01_01_000000_create_gateway_tables.php`](../services/whatsapp-gateway/database/migrations/0001_01_01_000000_create_gateway_tables.php))
  auto-load di service Gateway.
- Tabel Core ber-prefix `core_`. Tabel Gateway ber-prefix
  `gateway_`.
- Tenant ID adalah UUID string non-null dengan `restrictOnDelete`
  pada FK ke `core_tenants`.
- Composite uniqueness `(id, tenant_id)` pada tabel
  tenant-owned inti mencegah replikasi UUID lintas tenant.

### 4.3 ID convention

- Primary key seluruh model domain Core menggunakan UUID
  (trait `HasUuids`).
- Gateway principal/instance/delivery menggunakan UUID.
- `instanceId` adalah string logis (1–100 byte) yang dipilih
  caller; bukan primary key di Gateway (Gateway menyimpan
  `GatewayInstance::name` sebagai string unik).
- Idempotency key adalah string 8–200
  (`[A-Za-z0-9._:-]+`) dengan fungsi berbeda dari primary key.
- Audit `subject_id` disimpan sebagai string (UUID hasil
  `(string) $subject->getKey()`).
- **belum ada** — ULID, auto-increment integer, atau helper ID
  generator di paket.

### 4.4 Dokumentasi Gateway contract

[`contracts/whatsapp-gateway/openapi.yaml`](../contracts/whatsapp-gateway/openapi.yaml):

- OpenAPI `3.1.0`, versi `1.0.0`.
- `servers: - url: /api/v1`.
- `securitySchemes.bearerAuth: http/bearer`.
- Endpoint:
  - `GET /health` (publik).
  - `GET /ready` (publik; 503 bila dependency belum siap).
  - `GET /instances/{instanceId}/status`.
  - `POST /instances/{instanceId}/connect`.
  - `POST /instances/{instanceId}/disconnect`.
  - `POST /messages/text`
    (header `Idempotency-Key` wajib; respons `202`).
  - `POST /messages/media` (selalu `501 FEATURE_UNAVAILABLE`
    sampai SSRF-safe fetching tersedia).
- Skema `Error` tetap:
  `{ "code", "message", "request_id", "retryable" }`.
- Skema `SendResult.status`: `accepted | sent`.
- Skema `GatewayStatus`: `disconnected | connecting | connected |
  error`.

**belum ada** — generated SDK, halaman Redoc/Swagger UI, atau
generated conformance tests.

### 4.5 Deployment aktif

[`compose.yaml`](../compose.yaml):

- `postgres` (PostgreSQL 17) untuk Gateway.
- `redis` (Redis 7) untuk lock dan rate-limit.
- `gateway` (Laravel) dengan image internal.
- `EVOLUTION_API_DRIVER` env diteruskan ke container Gateway
  dengan default `http`; override `fake` diaktifkan saat runtime
  smoke.

**belum ada** — deployment production, Nginx unit, TLS, S3
kompatibel, image rilis otomatis, atau workload autoscaling.

---

## 5. Matriks kemampuan **belum ada**

Daftar pindai cepat untuk membedakan target vs aktif. Item dengan
penanda **belum ada** belum diimplementasikan dan harus dirancang
bersama saat dibutuhkan.

### 5.1 Core — Tenancy

- Concrete resolver (subdomain/header/session/JWT) **belum ada**.
- Auto-install middleware resolver **belum ada**.
- Queue propagation otomatis atau trait `TenantAwareJob`
  **belum ada**.

### 5.2 Core — Identity/Authorization

- Endpoint login/register/reset, MFA, API auth Sanctum/Passport
  **belum ada**.
- Policy kelas, CRUD role/permission UI atau API, wildcard
  permission, super-admin bypass **belum ada**.
- Composition profile untuk ekstensi `User` (karena `final`)
  **belum ada**.

### 5.3 Core — Feature Flags/Settings/Audit

- Percentage rollout, cohort, variant, schedule, cache
  **belum ada**.
- Global settings, typed schema, enkripsi nilai, cache
  **belum ada**.
- DB trigger, hash chain, raw SQL guard **belum ada**.

### 5.4 WhatsApp Client

- Enum `SendStatus` (saat ini masih string `accepted|sent`)
  **belum ada**.
- Tenant/principal-aware binding otomatis untuk fake
  **belum ada**.
- Validasi panjang/format `caption`/`filename` `MediaMessage`
  **belum ada**; batas hanya pada URL wajib HTTPS.
- Pengiriman media di Gateway masih `501 FEATURE_UNAVAILABLE`
  sampai SSRF-safe fetching tersedia.

### 5.5 Gateway

- Media delivery (`POST /messages/media`) **belum ada**;
  konstanta dikembalikan `501 FEATURE_UNAVAILABLE`.
- Generated SDK, conformance tests, dokumentasi render (Redoc UI)
  **belum ada**.
- Deployment production otomatis **belum ada**.

### 5.6 Aplikasi produk

- Template/skeleton Laravel standalone untuk produk **belum ada**.
- Contoh aplikasi seperti `enpii-laundry` **belum ada**.

---

## 6. Lampiran — referensi cepat ke file aktif

- Core service provider
  [`CoreServiceProvider.php`](../packages/core/src/CoreServiceProvider.php).
- Migration Core
  [`0001_…_create_enpii_core_tables.php`](../packages/core/database/migrations/0001_01_01_000000_create_enpii_core_tables.php).
- Test Core
  [`TenancyTest.php`](../packages/core/tests/TenancyTest.php),
  [`CoreBehaviorTest.php`](../packages/core/tests/CoreBehaviorTest.php).
- WhatsApp Client tests
  [`FakeWhatsAppGatewayTest.php`](../packages/whatsapp-client/tests/FakeWhatsAppGatewayTest.php),
  [`HttpWhatsAppGatewayTest.php`](../packages/whatsapp-client/tests/HttpWhatsAppGatewayTest.php).
- Gateway tests
  [`GatewayApiTest.php`](../services/whatsapp-gateway/tests/Feature/GatewayApiTest.php).
- Gateway OpenAPI
  [`openapi.yaml`](../contracts/whatsapp-gateway/openapi.yaml).
- Setup operasional
  [`docs/setup.md`](setup.md).
