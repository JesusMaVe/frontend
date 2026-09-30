import type { QueryClient } from '@tanstack/react-query'
import { createRouter, type RouterHistory } from '@tanstack/react-router'
import { setUnauthorizedHandler } from './api/client'
import { routeTree } from './routeTree.gen'

export function makeRouter(queryClient: QueryClient, history?: RouterHistory) {
  const router = createRouter({ routeTree, context: { queryClient }, history })
  // Si la API rechaza el token (vencido o inválido), api.ts ya lo borró: volver al login.
  setUnauthorizedHandler(() => {
    void router.navigate({ to: '/login', search: { redirect: router.state.location.href } })
  })
  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof makeRouter>
  }
}
