import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { beforeEach, expect, test } from 'vitest'
import { fakeJwt } from '../../test/jwt'
import { renderApp } from '../../test/render'
import { server } from '../../test/server'
import { setToken } from '../auth/token'

beforeEach(() => {
  server.use(http.get('/api/items', () => HttpResponse.json({ items: [] })))
})

const robots = () => document.head.querySelector('meta[name="robots"]')?.getAttribute('content')
const description = () => document.head.querySelector('meta[name="description"]')?.getAttribute('content')

test('/login tiene título y descripción propios y es indexable', async () => {
  renderApp('/login')
  await waitFor(() => expect(document.title).toBe('Iniciar sesión · Mis favoritos'))
  expect(description()).toMatch(/favoritos/i)
  expect(robots()).toBe('index, follow')
})

test('las rutas privadas no se indexan', async () => {
  setToken(fakeJwt())
  renderApp('/dashboard')
  await waitFor(() => expect(document.title).toBe('Tus elementos · Mis favoritos'))
  expect(robots()).toBe('noindex, nofollow')
})

test('/items/new tiene su título', async () => {
  setToken(fakeJwt())
  renderApp('/items/new')
  await waitFor(() => expect(document.title).toBe('Agregar un elemento · Mis favoritos'))
})

test('una ruta que no existe muestra el 404 con enlace de vuelta', async () => {
  renderApp('/no-existe')
  expect(await screen.findByRole('heading', { name: 'Página no encontrada' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Volver al inicio' })).toHaveAttribute('href', '/')
  await waitFor(() => expect(robots()).toBe('noindex, nofollow'))
})

test('la navegación marca la página activa', async () => {
  setToken(fakeJwt())
  renderApp('/dashboard')
  const nav = await screen.findByRole('navigation', { name: 'Principal' })
  expect(nav.querySelector('a[aria-current="page"]')).toHaveTextContent('Elementos')
})
