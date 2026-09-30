import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { expect, test } from 'vitest'
import { fakeJwt } from '../../test/jwt'
import { renderApp } from '../../test/render'
import { server } from '../../test/server'
import { getToken, setToken } from '../auth/token'

const zelda = { id: 1, title: 'Zelda', description: 'Breath of the Wild', created_by: 'alice', created_at: '2026-09-30T10:00:00Z' }

test('muestra los items y el GET lleva el Bearer', async () => {
  const token = fakeJwt()
  setToken(token)
  let authorization: string | null = null
  server.use(
    http.get('/api/items', ({ request }) => {
      authorization = request.headers.get('Authorization')
      return HttpResponse.json({ items: [zelda] })
    }),
  )
  renderApp('/dashboard')
  expect(await screen.findByText('Zelda')).toBeInTheDocument()
  expect(screen.getByText('Breath of the Wild')).toBeInTheDocument()
  expect(screen.getByText(/alice/)).toBeInTheDocument()
  expect(authorization).toBe(`Bearer ${token}`)
})

test('estado de carga y luego lista vacía', async () => {
  setToken(fakeJwt())
  server.use(http.get('/api/items', () => HttpResponse.json({ items: [] })))
  renderApp('/dashboard')
  expect(await screen.findByText('Cargando…')).toBeInTheDocument()
  expect(await screen.findByText('Todavía no agregaste nada.')).toBeInTheDocument()
})

test('error del servidor', async () => {
  setToken(fakeJwt())
  server.use(http.get('/api/items', () => HttpResponse.json({ error: 'internal error' }, { status: 500 })))
  renderApp('/dashboard')
  expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo cargar el listado.')
})

test('si la API rechaza el token (401) vuelve a /login y lo borra', async () => {
  setToken(fakeJwt())
  server.use(http.get('/api/items', () => HttpResponse.json({ error: 'unauthorized' }, { status: 401 })))
  const { router } = renderApp('/dashboard')
  await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
  expect(getToken()).toBeNull()
  expect(router.state.location.search).toEqual({ redirect: '/dashboard' })
})
