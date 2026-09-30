import { screen, waitFor } from '@testing-library/react'
import { delay, http, HttpResponse } from 'msw'
import { expect, test } from 'vitest'
import { fakeJwt } from '../../test/jwt'
import { renderApp } from '../../test/render'
import { server } from '../../test/server'
import { setToken } from '../auth/token'
import type { Item } from './api'

// API falsa con estado: lo que se crea con POST aparece en el siguiente GET.
function fakeItemsApi() {
  const items: Item[] = []
  const authorization: (string | null)[] = []
  server.use(
    http.get('/api/items', async ({ request }) => {
      authorization.push(request.headers.get('Authorization'))
      await delay(50) // latencia realista: deja ver si se pinta la caché vieja mientras llega la respuesta
      return HttpResponse.json({ items: [...items].reverse() })
    }),
    http.post('/api/items', async ({ request }) => {
      authorization.push(request.headers.get('Authorization'))
      const body = (await request.json()) as { title: string; description: string }
      const item = { id: items.length + 1, ...body, created_by: 'alice', created_at: '2026-09-30T10:00:00Z' }
      items.push(item)
      return HttpResponse.json(item, { status: 201 })
    }),
  )
  return { items, authorization }
}

test('agregar un elemento: el nuevo aparece en el dashboard y todas las requests llevan el Bearer', async () => {
  const token = fakeJwt()
  setToken(token)
  const api = fakeItemsApi()
  const { router, user } = renderApp('/dashboard')
  expect(await screen.findByText('Todavía no agregaste nada.')).toBeInTheDocument()

  await user.click(screen.getByRole('link', { name: 'Agregar' }))
  await waitFor(() => expect(router.state.location.pathname).toBe('/items/new'))
  await user.type(await screen.findByLabelText('Título'), '  Zelda  ')
  await user.type(screen.getByLabelText('Descripción'), 'Breath of the Wild')
  await user.click(screen.getByRole('button', { name: 'Guardar' }))

  await waitFor(() => expect(router.state.location.pathname).toBe('/dashboard'))
  // Al volver, el listado ya trae el nuevo: nunca se muestra la lista vieja (vacía) de la caché.
  expect(screen.queryByText('Todavía no agregaste nada.')).not.toBeInTheDocument()
  expect(await screen.findByText('Zelda')).toBeInTheDocument()
  expect(api.items).toEqual([expect.objectContaining({ title: 'Zelda', description: 'Breath of the Wild' })])
  expect(api.authorization.length).toBeGreaterThanOrEqual(3) // GET, POST, GET
  expect(api.authorization.every((a) => a === `Bearer ${token}`)).toBe(true)
})

test('validación en el cliente: no manda nada si el título está vacío', async () => {
  setToken(fakeJwt())
  const api = fakeItemsApi()
  const { user } = renderApp('/items/new')
  await user.click(await screen.findByRole('button', { name: 'Guardar' }))
  expect(await screen.findByText('El título es obligatorio')).toBeInTheDocument()
  expect(screen.getByLabelText('Título')).toHaveAttribute('aria-invalid', 'true')
  expect(api.items).toHaveLength(0)
})

test('muestra los errores por campo que devuelve la API (400)', async () => {
  setToken(fakeJwt())
  server.use(
    http.post('/api/items', () =>
      HttpResponse.json({ error: 'validation failed', fields: { title: 'ya existe' } }, { status: 400 }),
    ),
  )
  const { user } = renderApp('/items/new')
  await user.type(await screen.findByLabelText('Título'), 'Zelda')
  await user.click(screen.getByRole('button', { name: 'Guardar' }))
  expect(await screen.findByText('ya existe')).toBeInTheDocument()
})

test('otro error del servidor muestra un mensaje genérico', async () => {
  setToken(fakeJwt())
  server.use(http.post('/api/items', () => HttpResponse.json({ error: 'internal error' }, { status: 500 })))
  const { user } = renderApp('/items/new')
  await user.type(await screen.findByLabelText('Título'), 'Zelda')
  await user.click(screen.getByRole('button', { name: 'Guardar' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo guardar. Intenta de nuevo.')
})

test('el botón se deshabilita mientras guarda (sin doble envío)', async () => {
  setToken(fakeJwt())
  let calls = 0
  server.use(
    http.post('/api/items', async () => {
      calls++
      await delay(100)
      return HttpResponse.json({ id: 1 }, { status: 201 })
    }),
    http.get('/api/items', () => HttpResponse.json({ items: [] })),
  )
  const { router, user } = renderApp('/items/new')
  await user.type(await screen.findByLabelText('Título'), 'Zelda')
  await user.click(screen.getByRole('button', { name: 'Guardar' }))
  expect(screen.getByRole('button', { name: 'Guardando…' })).toBeDisabled()
  await waitFor(() => expect(router.state.location.pathname).toBe('/dashboard'))
  expect(calls).toBe(1)
})

test('Cancelar vuelve al dashboard', async () => {
  setToken(fakeJwt())
  fakeItemsApi()
  const { router, user } = renderApp('/items/new')
  await user.click(await screen.findByRole('link', { name: 'Cancelar' }))
  await waitFor(() => expect(router.state.location.pathname).toBe('/dashboard'))
})
