import { screen, waitFor, within } from '@testing-library/react'
import { delay, http, HttpResponse } from 'msw'
import { expect, test } from 'vitest'
import { fakeJwt } from '../../test/jwt'
import { renderApp } from '../../test/render'
import { server } from '../../test/server'
import { setToken } from '../auth/token'
import type { Item } from './api'

// fakeJwt() es de "alice": Zelda es suya, Mario es de bob.
const zelda: Item = { id: 1, title: 'Zelda', description: '', created_by: 'alice', created_at: '2026-09-30T10:00:00Z' }
const mario: Item = { id: 2, title: 'Mario', description: '', created_by: 'bob', created_at: '2026-09-29T10:00:00Z' }

function fakeApi(deleteStatus = 204) {
  const items = [zelda, mario]
  const deletes: { id: string; authorization: string | null }[] = []
  server.use(
    http.get('/api/items', () => HttpResponse.json({ items })),
    http.delete('/api/items/:id', async ({ params, request }) => {
      deletes.push({ id: String(params.id), authorization: request.headers.get('Authorization') })
      await delay(30)
      if (deleteStatus !== 204) return HttpResponse.json({ error: 'x' }, { status: deleteStatus })
      items.splice(items.findIndex((it) => it.id === Number(params.id)), 1)
      return new HttpResponse(null, { status: 204 })
    }),
  )
  return deletes
}

test('solo tus elementos tienen Editar y Eliminar', async () => {
  setToken(fakeJwt())
  fakeApi()
  renderApp('/dashboard')
  expect(await screen.findByRole('link', { name: 'Editar Zelda' })).toHaveAttribute('href', '/items/1/edit')
  expect(screen.getByRole('button', { name: 'Eliminar Zelda' })).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'Editar Mario' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Eliminar Mario' })).not.toBeInTheDocument()
})

test('eliminar pide confirmación, manda DELETE con el Bearer y quita la ficha', async () => {
  const token = fakeJwt()
  setToken(token)
  const deletes = fakeApi()
  const { user } = renderApp('/dashboard')
  await user.click(await screen.findByRole('button', { name: 'Eliminar Zelda' }))
  const dialog = screen.getByRole('dialog', { name: '¿Eliminar «Zelda»?' })
  expect(deletes).toHaveLength(0)
  await user.click(within(dialog).getByRole('button', { name: 'Eliminar' }))
  // Optimista: la ficha desaparece sin esperar a la API.
  await waitFor(() => expect(screen.queryByText('Zelda')).not.toBeInTheDocument())
  await waitFor(() => expect(deletes).toEqual([{ id: '1', authorization: `Bearer ${token}` }]))
  expect(screen.getByText('Mario')).toBeInTheDocument()
  expect(screen.getByText('1 elemento')).toBeInTheDocument()
})

test('cancelar la confirmación no borra nada', async () => {
  setToken(fakeJwt())
  const deletes = fakeApi()
  const { user } = renderApp('/dashboard')
  await user.click(await screen.findByRole('button', { name: 'Eliminar Zelda' }))
  await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancelar' }))
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(screen.getByText('Zelda')).toBeInTheDocument()
  expect(deletes).toHaveLength(0)
})

test('si la API falla, la ficha vuelve y se explica qué pasó', async () => {
  setToken(fakeJwt())
  fakeApi(500)
  const { user } = renderApp('/dashboard')
  await user.click(await screen.findByRole('button', { name: 'Eliminar Zelda' }))
  await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Eliminar' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo eliminar «Zelda». Inténtalo de nuevo.')
  expect(await screen.findByText('Zelda')).toBeInTheDocument()
})
