import type { paths as mediaPaths } from './generated/media'
import type { paths as notificationPaths } from './generated/notification'

export type BridgePath = keyof mediaPaths | keyof notificationPaths

type BridgePaths = mediaPaths & notificationPaths

type MediaOperation<TPath extends keyof mediaPaths> =
  TPath extends '/api/v1/media'
    ? mediaPaths['/api/v1/media']['get'] | mediaPaths['/api/v1/media']['post']
    : TPath extends '/api/v1/media/{media}'
      ? Exclude<mediaPaths['/api/v1/media/{media}'][keyof mediaPaths['/api/v1/media/{media}']], undefined>
      : never

type NotificationOperation<TPath extends keyof notificationPaths> =
  TPath extends '/api/v1/notifications'
    ? notificationPaths['/api/v1/notifications']['get']
    : TPath extends '/api/v1/notifications/unread-count'
      ? notificationPaths['/api/v1/notifications/unread-count']['get']
      : TPath extends '/api/v1/notifications/mark-all-read'
        ? notificationPaths['/api/v1/notifications/mark-all-read']['post']
        : TPath extends '/api/v1/notifications/{id}/mark-read'
          ? notificationPaths['/api/v1/notifications/{id}/mark-read']['post']
          : never

export type OperationsForPath<TPath extends BridgePath> = TPath extends keyof mediaPaths
  ? MediaOperation<TPath>
  : TPath extends keyof notificationPaths
    ? NotificationOperation<TPath>
    : never

type JsonResponse<Operation> = Operation extends { responses: infer Responses }
  ? Responses extends { 200: infer Body200 }
    ? Body200 extends { content: { 'application/json': infer Body } } ? Body : never
    : never
  : never

export type BridgeConfig = {
  baseUrl: string
  tenantId?: string
  locale?: string
  authorization?: string
  fetch?: typeof fetch
}

export type BridgeRequestOptions<TPath extends BridgePath> = {
  method: 'get' | 'post' | 'put' | 'patch' | 'delete'
  path: TPath
  pathParams?: Record<string, string | number>
  params?: Record<string, string | number | boolean | undefined>
  body?: unknown
  signal?: AbortSignal
  tenantId?: string
  locale?: string
}

export type BridgeValidationError = {
  status: 422
  code: 'validation_failed'
  message: string
  fields: Record<string, string[]>
}

export type BridgeHttpError = {
  status: 401 | 403 | 404
  code: 'unauthenticated' | 'forbidden' | 'not_found'
  message: string
  fields: Record<string, string[]>
}

export class BridgeError extends Error {
  readonly status: BridgeValidationError['status'] | BridgeHttpError['status']
  readonly code: BridgeValidationError['code'] | BridgeHttpError['code']
  readonly fields: Record<string, string[]>

  constructor(error: BridgeValidationError | BridgeHttpError) {
    super(error.message)
    this.name = 'BridgeError'
    this.status = error.status
    this.code = error.code
    this.fields = error.fields
  }
}

export type BridgeSuccess<TData, TMeta = unknown, TLinks = unknown> =
  TMeta extends undefined
    ? { data: TData; meta?: undefined; links?: undefined }
    : { data: TData; meta: TMeta; links?: TLinks }

const errorCodesByStatus = {
  401: 'unauthenticated',
  403: 'forbidden',
  404: 'not_found',
} as const

function resolveUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(path, 'https://bridge.invalid')
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value))
    }
  }
  return `${url.pathname}${url.search}`
}

function normalizeError(status: number, payload: unknown): BridgeError {
  const errorValue = (payload as { error?: unknown } | null)?.error
  const errorMessage = (payload as { message?: unknown } | null)?.message
  const fields = (errorValue as { fields?: unknown } | null)?.fields
  const code = (errorValue as { code?: unknown } | null)?.code
  const message = typeof (errorValue as { message?: unknown } | null)?.message === 'string'
    ? String((errorValue as { message?: unknown }).message)
    : typeof errorMessage === 'string'
      ? errorMessage
      : 'Request failed'

  if (status === 422) {
    const normalizedFields: Record<string, string[]> = {}
    if (fields && typeof fields === 'object') {
      for (const [field, values] of Object.entries(fields as Record<string, unknown>)) {
        normalizedFields[field] = Array.isArray(values)
          ? values.map(String)
          : [String(values)]
      }
    }
    return new BridgeError({ status: 422, code: 'validation_failed', message, fields: normalizedFields })
  }

  return new BridgeError({
    status: status as 401 | 403 | 404,
    code: typeof code === 'string'
      ? code as BridgeHttpError['code']
      : errorCodesByStatus[status as keyof typeof errorCodesByStatus],
    message,
    fields: {},
  })
}

export async function request<
  TPath extends BridgePath,
  TMethod extends BridgeRequestOptions<TPath>['method'],
>(
  config: BridgeConfig,
  options: BridgeRequestOptions<TPath> & { method: TMethod },
): Promise<JsonResponse<Extract<OperationsForPath<TPath>, { responses: unknown }>>> {
  const fetchFn = config.fetch ?? globalThis.fetch
  const headers = new Headers()
  const tenantId = options.tenantId ?? config.tenantId
  const locale = options.locale ?? config.locale
  if (tenantId !== undefined) headers.set('X-Tenant-Id', tenantId)
  if (locale !== undefined) headers.set('Accept-Language', locale)
  if (config.authorization !== undefined) headers.set('Authorization', config.authorization)

  let body: BodyInit | undefined
  if (options.body instanceof FormData) {
    body = options.body
  } else if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json')
    body = JSON.stringify(options.body)
  }

  let path: string = options.path
  for (const [key, value] of Object.entries(options.pathParams ?? {})) {
    path = path.replace(`{${key}}`, encodeURIComponent(String(value)))
  }

  const response = await fetchFn(resolveUrl(path, options.params), {
    method: options.method.toUpperCase(),
    headers,
    body,
    signal: options.signal,
  })

  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    throw normalizeError(response.status, payload)
  }

  const data = (payload as { data?: unknown } | null)?.data
  if (data === undefined) {
    return payload as JsonResponse<Extract<OperationsForPath<TPath>, { responses: unknown }>>
  }
  return {
    data,
    meta: (payload as { meta?: unknown }).meta,
    links: (payload as { links?: unknown }).links,
  } as JsonResponse<Extract<OperationsForPath<TPath>, { responses: unknown }>>
}
