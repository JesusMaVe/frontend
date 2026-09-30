import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
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
  const { user } = Route.useRouteContext()
  return (
    <>
      <div className="actions">
        <span className="meta">{user.name ?? user.sub}</span>
      </div>
      <Outlet />
    </>
  )
}
