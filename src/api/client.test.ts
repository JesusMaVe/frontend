import { http, HttpResponse } from 'msw'
import { afterEach, expect, test, vi } from 'vitest'
import { getToken, setToken } from '../features/auth/token'
import { fakeJwt } from '../test/jwt'
import { server } from '../test/server'
import { api, ApiError, setUnauthorizedHandler } from './client'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
  setUnauthorizedHandler(() => {})
})

function captureAuthorization() {
  const seen: (string | null)[] = []
  server.use(
    http.get('/api/items', ({ request }) => {
      seen.push(request.headers.get('Authorization'))
      return HttpResponse.json({ items: [] })
    }),
  )
  return seen
}

test('con token, CADA request lleva Authorization: Bearer <jwt>', async () => {
  const token = fakeJwt()
  setToken(token)
  const seen = captureAuthorization()
  await api('/api/items')
  await api('/api/items')
  expect(seen).toEqual([`Bearer ${token}`, `Bearer ${token}`])
})

test('con VITE_LOG_JWT=true hace console.log del JWT en cada request', async () => {
  vi.stubEnv('VITE_LOG_JWT', 'true')
  const log = vi.spyOn(console, 'log').mockImplementation(() => {})
  const token = fakeJwt()
  setToken(token)
  captureAuthorization()
  await api('/api/items')
  await api('/api/items')
  expect(log).toHaveBeenCalledTimes(2)
  expect(log).toHaveBeenCalledWith('[api]', 'GET', '/api/items', 'Bearer', token)
})

test('con VITE_LOG_JWT=false no imprime nada', async () => {
  vi.stubEnv('VITE_LOG_JWT', 'false')
  const log = vi.spyOn(console, 'log').mockImplementation(() => {})
  setToken(fakeJwt())
  captureAuthorization()
  await api('/api/items')
  expect(log).not.toHaveBeenCalled()
})

test('sin token no manda Authorization ni imprime', async () => {
  vi.stubEnv('VITE_LOG_JWT', 'true')
  const log = vi.spyOn(console, 'log').mockImplementation(() => {})
  const seen = captureAuthorization()
  await api('/api/items')
  expect(seen).toEqual([null])
  expect(log).not.toHaveBeenCalled()
})

test('POST manda el body como JSON y devuelve la respuesta', async () => {
  let received: unknown
  server.use(
    http.post('/api/items', async ({ request }) => {
      received = await request.json()
      return HttpResponse.json({ id: 1 }, { status: 201 })
    }),
  )
  await expect(api('/api/items', { method: 'POST', body: { title: 'Zelda' } })).resolves.toEqual({ id: 1 })
  expect(received).toEqual({ title: 'Zelda' })
})

test('un error HTTP es un ApiError con status y body', async () => {
  server.use(http.get('/api/items', () => HttpResponse.json({ error: 'internal error' }, { status: 500 })))
  const err = await api('/api/items').catch((e: unknown) => e)
  expect(err).toBeInstanceOf(ApiError)
  expect(err).toMatchObject({ status: 500, body: { error: 'internal error' } })
})

test('un 401 con token borra el token y avisa (sesión vencida o token rechazado)', async () => {
  setToken(fakeJwt())
  const onUnauthorized = vi.fn()
  setUnauthorizedHandler(onUnauthorized)
  server.use(http.get('/api/items', () => HttpResponse.json({ error: 'unauthorized' }, { status: 401 })))
  await expect(api('/api/items')).rejects.toMatchObject({ status: 401 })
  expect(getToken()).toBeNull()
  expect(onUnauthorized).toHaveBeenCalledOnce()
})

test('un 401 sin token (login fallido) no dispara el handler', async () => {
  const onUnauthorized = vi.fn()
  setUnauthorizedHandler(onUnauthorized)
  server.use(http.post('/auth/token', () => HttpResponse.json({ error: 'invalid credentials' }, { status: 401 })))
  await expect(api('/auth/token', { method: 'POST', body: {} })).rejects.toMatchObject({ status: 401 })
  expect(onUnauthorized).not.toHaveBeenCalled()
})
