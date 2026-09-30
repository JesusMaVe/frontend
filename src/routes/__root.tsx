import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, HeadContent, Outlet } from '@tanstack/react-router'
import { NotFoundPage, ProgressBar } from '../features/layout/Pages'
import { seo } from '../features/layout/seo'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => seo({ description: 'Guarda y encuentra tus favoritos en un solo lugar.' }),
  component: RootLayout,
  notFoundComponent: NotFoundPage,
})

function RootLayout() {
  return (
    <>
      <HeadContent />
      <a href="#contenido" className="skip-link">
        Saltar al contenido
      </a>
      <ProgressBar />
      <Outlet />
    </>
  )
}
