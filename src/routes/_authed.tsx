import { createFileRoute, Outlet, redirect, useNavigate } from '@tanstack/react-router'
import { clearToken, currentUser } from '../features/auth/token'

export const Route = createFileRoute('/_authed')({
  beforeLoad: ({ location }) => {
    const user = currentUser()
    if (!user) {
      clearToken()
      throw redirect({ to: '/login', search: { redirect: location.href } })
    }
    return { user }
  },
  component: AuthedLayout,
})

function AuthedLayout() {
  const { user, queryClient } = Route.useRouteContext()
  const navigate = useNavigate()
  // El logout es solo del lado del cliente: la API no tiene sesión que cerrar.
  const logout = () => {
    clearToken()
    queryClient.clear()
    void navigate({ to: '/login' })
  }
  return (
    <>
      <div className="actions">
        <span className="meta">{user.name ?? user.sub}</span>
        <button type="button" className="secondary" onClick={logout}>
          Cerrar sesión
        </button>
      </div>
      <Outlet />
    </>
  )
}
