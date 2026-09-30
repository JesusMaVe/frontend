import type { QueryClient } from '@tanstack/react-query'
import { createRouter, type RouterHistory } from '@tanstack/react-router'
import { setUnauthorizedHandler } from './api/client'
import { ErrorPage, NotFoundPage } from './features/layout/Pages'
import { routeTree } from './routeTree.gen'

export function makeRouter(queryClient: QueryClient, history?: RouterHistory) {
  const router = createRouter({
    routeTree,
    context: { queryClient },
    history,
    // Precarga la ruta (y su loader) al pasar el mouse o enfocar un <Link>. La caché de datos es
    // de TanStack Query, así que el router no guarda la suya (staleTime 0).
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    scrollRestoration: true,
    defaultErrorComponent: ErrorPage,
    defaultNotFoundComponent: NotFoundPage,
  })
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
