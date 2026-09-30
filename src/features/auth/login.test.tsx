import { screen, waitFor } from '@testing-library/react'
import { delay, http, HttpResponse } from 'msw'
import { expect, test } from 'vitest'
import { fakeJwt } from '../../test/jwt'
import { renderApp } from '../../test/render'
import { server } from '../../test/server'
import { getToken, setToken } from './token'

async function fillAndSubmit(user: ReturnType<typeof renderApp>['user']) {
  await user.type(await screen.findByLabelText('Usuario'), 'alice')
  await user.type(screen.getByLabelText('Contraseña'), ' secreta ')
  await user.click(screen.getByRole('button', { name: 'Entrar' }))
}

test('login correcto: manda usuario y contraseña a /auth/token, guarda el token y va al dashboard', async () => {
  const token = fakeJwt()
  let sent: unknown
  let authorization: string | null = 'sin llamar'
  server.use(
    http.post('/auth/token', async ({ request }) => {
      sent = await request.json()
      authorization = request.headers.get('Authorization')
      return HttpResponse.json({ token })
    }),
  )
  const { router, user } = renderApp('/login')
  await fillAndSubmit(user)
  await waitFor(() => expect(router.state.location.pathname).toBe('/dashboard'))
  expect(sent).toEqual({ username: 'alice', password: ' secreta ' })
  expect(authorization).toBeNull()
  expect(getToken()).toBe(token)
})

test('vuelve a la ruta interna de ?redirect', async () => {
  server.use(http.post('/auth/token', () => HttpResponse.json({ token: fakeJwt() })))
  const { router, user } = renderApp('/login?redirect=%2Fdashboard%3Fx%3D1')
  await fillAndSubmit(user)
  await waitFor(() => expect(router.state.location.href).toBe('/dashboard?x=1'))
})

test('un redirect externo se ignora y termina en /dashboard', async () => {
  server.use(http.post('/auth/token', () => HttpResponse.json({ token: fakeJwt() })))
  const { router, user } = renderApp('/login?redirect=https%3A%2F%2Fevil.com')
  await fillAndSubmit(user)
  await waitFor(() => expect(router.state.location.pathname).toBe('/dashboard'))
})

test.each([
  [401, 'Usuario o contraseña incorrectos'],
  [429, 'Demasiados intentos. Espera un minuto.'],
  [502, 'No se pudo iniciar sesión. Intenta de nuevo.'],
])('HTTP %i muestra "%s" y no guarda nada', async (status, message) => {
  server.use(http.post('/auth/token', () => HttpResponse.json({ error: 'x' }, { status })))
  const { router, user } = renderApp('/login')
  await fillAndSubmit(user)
  expect(await screen.findByRole('alert')).toHaveTextContent(message)
  expect(getToken()).toBeNull()
  expect(router.state.location.pathname).toBe('/login')
})

test('el botón se deshabilita mientras envía (sin doble envío)', async () => {
  let calls = 0
  server.use(
    http.post('/auth/token', async () => {
      calls++
      await delay(100)
      return HttpResponse.json({ token: fakeJwt() })
    }),
  )
  const { user } = renderApp('/login')
  await fillAndSubmit(user)
  expect(screen.getByRole('button', { name: 'Entrando…' })).toBeDisabled()
  await waitFor(() => expect(getToken()).not.toBeNull())
  expect(calls).toBe(1)
})

test('con un token vencido guardado, el login no lo manda y un 401 se queda en /login con el mensaje', async () => {
  setToken(fakeJwt({ exp: Math.floor(Date.now() / 1000) - 60 }))
  let authorization: string | null = 'sin llamar'
  server.use(
    http.post('/auth/token', ({ request }) => {
      authorization = request.headers.get('Authorization')
      return HttpResponse.json({ error: 'invalid credentials' }, { status: 401 })
    }),
  )
  const { router, user } = renderApp('/login')
  await fillAndSubmit(user)
  expect(await screen.findByRole('alert')).toHaveTextContent('Usuario o contraseña incorrectos')
  expect(authorization).toBeNull()
  expect(router.state.location.href).toBe('/login')
})
