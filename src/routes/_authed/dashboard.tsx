import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '../../features/items/Dashboard'

export const Route = createFileRoute('/_authed/dashboard')({
  component: Dashboard,
})
