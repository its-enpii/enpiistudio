# @its-enpii/bridge

Typed native-fetch bridge for Enpii Studio core APIs and the WhatsApp gateway.

```ts
import { request } from '@its-enpii/bridge'

const media = await request(
  { baseUrl: 'https://core.example', tenantId: '<uuid>', locale: 'id' },
  { method: 'get', path: '/api/v1/media', params: { page: 1 } },
)
```

- Response envelopes are unwrapped to `{ data, meta, links }`.
- HTTP 401, 403, 404, and 422 responses become `BridgeError`.
- `X-Tenant-Id` and `Accept-Language` can be configured globally or per call.
- No HTTP client dependency is used; the package calls native `fetch`.

Types are generated from OpenAPI contracts:

```bash
npm run bridge:generate
```
