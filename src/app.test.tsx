import { screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { renderApp } from './test/render'

test('la app renderiza con router y query', async () => {
  renderApp('/')
  expect(await screen.findByRole('heading', { level: 1, name: 'Mis favoritos' })).toBeInTheDocument()
})
