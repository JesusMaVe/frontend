import { clearToken, getToken } from '../features/auth/token'

export class ApiError extends Error {
  readonly status: number
  readonly body: unknown

  constructor(status: number, body: unknown) {
    super(`HTTP ${status}`)
    this.status = status
    this.body = body
  }
}

let onUnauthorized: () => void = () => {}

// setUnauthorizedHandler registra qué hacer cuando la API rechaza el token (el router: ir a /login).
export function setUnauthorizedHandler(fn: () => void): void {
  onUnauthorized = fn
}

type Options = { method?: 'GET' | 'POST'; body?: unknown }

// api es el ÚNICO punto de salida hacia auth-svc y la API. Si hay token lo inyecta como
// Authorization: Bearer en cada request y, con VITE_LOG_JWT=true, lo muestra en consola.
export async function api<T>(path: string, { method = 'GET', body }: Options = {}): Promise<T> {
  const headers = new Headers({ Accept: 'application/json' })
  if (body !== undefined) headers.set('Content-Type', 'application/json')
  const token = getToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
    if (import.meta.env.VITE_LOG_JWT === 'true') console.log('[api]', method, path, 'Bearer', token)
  }
  const res = await fetch(path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) })
  const data: unknown = await res.json().catch(() => null)
  if (!res.ok) {
    if (res.status === 401 && token) {
      clearToken()
      onUnauthorized()
    }
    throw new ApiError(res.status, data)
  }
  return data as T
}
