import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { beforeEach, expect, test } from 'vitest'
import { fakeJwt } from '../../test/jwt'
import { renderApp } from '../../test/render'
import { server } from '../../test/server'
import { getToken, setToken } from './token'

// El dashboard pide /api/items al abrirse con sesión; MSW falla ante requests no manejados.
beforeEach(() => {
  server.use(http.get('/api/items', () => HttpResponse.json({ items: [] })))
})

test('cerrar sesión borra el token y la caché y lleva a /login; volver al dashboard pide login', async () => {
  setToken(fakeJwt())
  const { router, queryClient, user } = renderApp('/dashboard')
  queryClient.setQueryData(['items'], [
    { id: 1, title: 'Zelda', description: '', created_by: 'alice', created_at: '2026-09-30T10:00:00Z' },
  ])
  await user.click(await screen.findByRole('button', { name: 'Cerrar sesión' }))
  await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
  expect(getToken()).toBeNull()
  expect(queryClient.getQueryCache().getAll()).toHaveLength(0)

  await router.navigate({ to: '/dashboard' })
  await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
})
