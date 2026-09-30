import { QueryClient } from '@tanstack/react-query'
import { createMemoryHistory } from '@tanstack/react-router'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from '../app'
import { makeRouter } from '../router'

// renderApp monta la app real (rutas, providers) empezando en `path`.
export function renderApp(path: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  const router = makeRouter(queryClient, createMemoryHistory({ initialEntries: [path] }))
  const user = userEvent.setup()
  render(<App router={router} queryClient={queryClient} />)
  return { router, queryClient, user }
}
