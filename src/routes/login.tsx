import { createFileRoute, redirect } from '@tanstack/react-router'
import { LoginPage } from '../features/auth/LoginPage'
import { clearToken, currentUser } from '../features/auth/token'

export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
  beforeLoad: () => {
    if (currentUser()) throw redirect({ to: '/dashboard' })
    // Un token vencido que quedó guardado no debe viajar (ni loguearse) en el POST del login.
    clearToken()
  },
  component: LoginRoute,
})

function LoginRoute() {
  const { redirect } = Route.useSearch()
  return <LoginPage redirect={redirect} />
}
