import { afterEach, describe, expect, it, vi } from 'vitest'
import { BridgeError, request } from '../src/client'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('request', () => {
  it('unwraps collection envelope', async () => {
    const fetchMock = vi.fn(async () => jsonResponse({
      data: [{ id: 'media-id', title: null }],
      meta: { current_page: 1, per_page: 25, total: 1 },
      links: { next: null },
    }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await request(
      { baseUrl: 'https://core.test' },
      { method: 'get' as const, path: '/api/v1/media' as const, params: { page: 1 } },
    )

    expect(result.data).toHaveLength(1)
    expect(result.meta).toEqual({ current_page: 1, per_page: 25, total: 1 })
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/media?page=1',
      expect.objectContaining({ method: 'GET' }),
    )
  })

  it('normalizes validation and http errors', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({
        error: {
          code: 'validation_failed',
          message: 'The file field is required.',
          fields: { file: ['The file field is required.'] },
        },
      }, 422))
      .mockResolvedValueOnce(jsonResponse({ message: 'Unauthenticated.' }, 401))
    vi.stubGlobal('fetch', fetchMock)

    const validation = await request({ baseUrl: 'https://core.test' }, {
      method: 'post' as const,
      path: '/api/v1/media' as const,
    }).catch((error: unknown) => error)
    const unauthorized = await request({ baseUrl: 'https://core.test' }, {
      method: 'get' as const,
      path: '/api/v1/notifications' as const,
    }).catch((error: unknown) => error)

    expect(validation).toBeInstanceOf(BridgeError)
    expect(validation).toMatchObject({
      status: 422,
      code: 'validation_failed',
      fields: { file: ['The file field is required.'] },
    })
    expect(unauthorized).toBeInstanceOf(BridgeError)
    expect(unauthorized).toMatchObject({ status: 401, code: 'unauthenticated' })
  })

  it('injects tenant and locale headers with per-call overrides', async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => jsonResponse({ count: 0 }))
    vi.stubGlobal('fetch', fetchMock)

    await request(
      { baseUrl: 'https://core.test', tenantId: 'tenant-a', locale: 'id' },
      {
        method: 'get',
        path: '/api/v1/notifications/unread-count',
        tenantId: 'tenant-b',
        locale: 'en',
      },
    )

    const call = fetchMock.mock.calls[0]
    expect(call).toBeDefined()
    const headers = call?.[1]?.headers as Headers
    expect(headers.get('X-Tenant-Id')).toBe('tenant-b')
    expect(headers.get('Accept-Language')).toBe('en')
  })
})
