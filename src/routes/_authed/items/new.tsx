import { createFileRoute } from '@tanstack/react-router'
import { NewItemPage } from '../../../features/items/NewItemPage'
import { seo } from '../../../features/layout/seo'

export const Route = createFileRoute('/_authed/items/new')({
  head: () => seo({ title: 'Agregar un elemento', description: 'Guarda un nuevo favorito.' }),
  component: NewItemPage,
})
