import { createFileRoute, redirect } from '@tanstack/react-router'
import { currentUser } from '../features/auth/token'

export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
  beforeLoad: () => {
    if (currentUser()) throw redirect({ to: '/dashboard' })
  },
  component: () => <h2>Iniciar sesión</h2>,
})
