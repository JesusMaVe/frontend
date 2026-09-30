import { screen, waitFor } from '@testing-library/react'
import { expect, test } from 'vitest'
import { fakeJwt } from '../../test/jwt'
import { renderApp } from '../../test/render'
import { getToken, setToken } from './token'

test('cerrar sesión borra el token y la caché y lleva a /login; volver al dashboard pide login', async () => {
  setToken(fakeJwt())
  const { router, queryClient, user } = renderApp('/dashboard')
  queryClient.setQueryData(['items'], [{ id: 1 }])
  await user.click(await screen.findByRole('button', { name: 'Cerrar sesión' }))
  await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
  expect(getToken()).toBeNull()
  expect(queryClient.getQueryCache().getAll()).toHaveLength(0)

  await router.navigate({ to: '/dashboard' })
  await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
})
