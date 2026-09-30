import { screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { expect, test } from 'vitest'
import { fakeJwt } from '../../test/jwt'
import { renderApp } from '../../test/render'
import { server } from '../../test/server'
import { setToken } from '../auth/token'
import type { Item } from './api'

const zelda: Item = { id: 1, title: 'Zelda', description: 'BOTW', created_by: 'alice', created_at: '2026-09-30T10:00:00Z' }
const mario: Item = { id: 2, title: 'Mario', description: '', created_by: 'bob', created_at: '2026-09-29T10:00:00Z' }

function fakeApi(putStatus = 200) {
  const items = [zelda, mario].map((it) => ({ ...it }))
  const puts: { id: string; body: unknown; authorization: string | null }[] = []
  const deletes: string[] = []
  server.use(
    http.get('/api/items', () => HttpResponse.json({ items })),
    http.put('/api/items/:id', async ({ params, request }) => {
      const body = (await request.json()) as { title: string; description: string }
      puts.push({ id: String(params.id), body, authorization: request.headers.get('Authorization') })
      if (putStatus !== 200) return HttpResponse.json({ error: 'x' }, { status: putStatus })
      const it = items.find((i) => i.id === Number(params.id))!
      Object.assign(it, body)
      return HttpResponse.json(it)
    }),
    http.delete('/api/items/:id', ({ params }) => {
      deletes.push(String(params.id))
      items.splice(items.findIndex((i) => i.id === Number(params.id)), 1)
      return new HttpResponse(null, { status: 204 })
    }),
  )
  return { puts, deletes }
}

test('editar: el formulario viene lleno, manda PUT con el Bearer y vuelve al muro con el cambio', async () => {
  const token = fakeJwt()
  setToken(token)
  const api = fakeApi()
  const { router, user } = renderApp('/items/1/edit')
  expect(await screen.findByRole('heading', { name: 'Editar «Zelda»' })).toBeInTheDocument()
  const title = screen.getByLabelText('Título')
  expect(title).toHaveValue('Zelda')
  expect(screen.getByLabelText('Descripción')).toHaveValue('BOTW')

  await user.clear(title)
  await user.type(title, 'Zelda TOTK')
  await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

  await waitFor(() => expect(router.state.location.pathname).toBe('/dashboard'))
  expect(api.puts).toEqual([{ id: '1', body: { title: 'Zelda TOTK', description: 'BOTW' }, authorization: `Bearer ${token}` }])
  expect(await screen.findByText('Zelda TOTK')).toBeInTheDocument()
})

test('desde el muro, Editar lleva al formulario', async () => {
  setToken(fakeJwt())
  fakeApi()
  const { router, user } = renderApp('/dashboard')
  await user.click(await screen.findByRole('link', { name: 'Editar Zelda' }))
  await waitFor(() => expect(router.state.location.pathname).toBe('/items/1/edit'))
  expect(await screen.findByLabelText('Título')).toHaveValue('Zelda')
})

test('un elemento de otro usuario no se puede editar', async () => {
  setToken(fakeJwt())
  fakeApi()
  renderApp('/items/2/edit')
  expect(await screen.findByRole('heading', { name: 'No puedes editar «Mario»' })).toBeInTheDocument()
  expect(screen.getByText(/Solo bob puede editarlo o eliminarlo/)).toBeInTheDocument()
  expect(screen.queryByLabelText('Título')).not.toBeInTheDocument()
})

test('un id que no existe muestra que el elemento ya no está', async () => {
  setToken(fakeJwt())
  fakeApi()
  renderApp('/items/999/edit')
  expect(await screen.findByRole('heading', { name: 'Este elemento ya no existe' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Volver a tus elementos' })).toHaveAttribute('href', '/dashboard')
})

test('si la API responde 403 al guardar, se explica y no se navega', async () => {
  setToken(fakeJwt())
  fakeApi(403)
  const { router, user } = renderApp('/items/1/edit')
  await user.click(await screen.findByRole('button', { name: 'Guardar cambios' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('Solo quien agregó este elemento puede cambiarlo.')
  expect(router.state.location.pathname).toBe('/items/1/edit')
})

test('eliminar desde la edición confirma, borra y vuelve al muro', async () => {
  setToken(fakeJwt())
  const api = fakeApi()
  const { router, user } = renderApp('/items/1/edit')
  await user.click(await screen.findByRole('button', { name: 'Eliminar elemento' }))
  await user.click(within(screen.getByRole('dialog', { name: '¿Eliminar «Zelda»?' })).getByRole('button', { name: 'Eliminar' }))
  await waitFor(() => expect(router.state.location.pathname).toBe('/dashboard'))
  expect(api.deletes).toEqual(['1'])
  expect(await screen.findByText('Mario')).toBeInTheDocument()
  expect(screen.queryByText('Zelda')).not.toBeInTheDocument()
})
