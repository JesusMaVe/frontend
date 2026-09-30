import { screen, waitFor } from '@testing-library/react'
import { expect, test } from 'vitest'
import { fakeJwt } from '../../test/jwt'
import { renderApp } from '../../test/render'
import { getToken, setToken } from './token'

test('sin token, una ruta protegida manda a /login con redirect a donde quería ir', async () => {
  const { router } = renderApp('/dashboard')
  await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
  expect(router.state.location.search).toEqual({ redirect: '/dashboard' })
})

test('con token expirado también manda a /login y borra el token', async () => {
  setToken(fakeJwt({ exp: Math.floor(Date.now() / 1000) - 10 }))
  const { router } = renderApp('/dashboard')
  await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
  expect(getToken()).toBeNull()
})

test('con token válido renderiza la ruta hija y muestra al usuario', async () => {
  setToken(fakeJwt({ name: 'Ñoño Pérez' }))
  renderApp('/dashboard')
  expect(await screen.findByRole('heading', { name: 'Tus elementos' })).toBeInTheDocument()
  expect(screen.getByText('Ñoño Pérez')).toBeInTheDocument()
})

test('/ lleva a /dashboard', async () => {
  setToken(fakeJwt())
  const { router } = renderApp('/')
  await waitFor(() => expect(router.state.location.pathname).toBe('/dashboard'))
})

test('/login con sesión activa lleva a /dashboard', async () => {
  setToken(fakeJwt())
  const { router } = renderApp('/login')
  await waitFor(() => expect(router.state.location.pathname).toBe('/dashboard'))
})

test('/login ignora un redirect externo en la URL', async () => {
  const { router } = renderApp('/login?redirect=https://evil.com')
  await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
  expect(router.state.location.search).toEqual({ redirect: 'https://evil.com' })
  // El valor se guarda tal cual en la URL, pero solo se usa pasado por safeRedirect (ver redirect.test.ts
  // y el test de login de la Task 3, que comprueba que se termina en /dashboard).
})
