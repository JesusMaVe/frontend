import { createFileRoute } from '@tanstack/react-router'
import { itemsQueryOptions } from '../../features/items/api'
import { Dashboard } from '../../features/items/Dashboard'
import { seo } from '../../features/layout/seo'

export const Route = createFileRoute('/_authed/dashboard')({
  // ?q= es estado de la URL (compartible, sobrevive a recargar): el router lo valida y lo tipa.
  validateSearch: (search: Record<string, unknown>): { q?: string } => ({
    q: typeof search.q === 'string' && search.q !== '' ? search.q : undefined,
  }),
  // Precarga el listado en la caché de Query (también al pasar el mouse sobre un enlace: preload
  // 'intent'). Sin await: la página se pinta ya y muestra su propio estado de carga.
  loader: ({ context }) => {
    void context.queryClient.prefetchQuery(itemsQueryOptions)
  },
  head: () => seo({ title: 'Tus elementos', description: 'Tu listado de favoritos.' }),
  component: DashboardRoute,
})

function DashboardRoute() {
  const { q } = Route.useSearch()
  const { user } = Route.useRouteContext()
  const navigate = Route.useNavigate()
  return <Dashboard me={user.sub} query={q ?? ''} onQueryChange={(value) => void navigate({ search: { q: value || undefined }, replace: true })} />
}
