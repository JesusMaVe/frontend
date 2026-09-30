import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootLayout,
})

function RootLayout() {
  return (
    <div className="shell">
      <header className="topbar">
        <h1>Mis favoritos</h1>
      </header>
      <Outlet />
    </div>
  )
}
