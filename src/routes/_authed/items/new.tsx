import { createFileRoute } from '@tanstack/react-router'
import { NewItemPage } from '../../../features/items/NewItemPage'

export const Route = createFileRoute('/_authed/items/new')({
  component: NewItemPage,
})
