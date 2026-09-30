import { createFileRoute, notFound } from '@tanstack/react-router'
import { itemsQueryOptions } from '../../../../features/items/api'
import { EditItemPage, ItemGone, NotYourItem } from '../../../../features/items/EditItemPage'
import { seo } from '../../../../features/layout/seo'

export const Route = createFileRoute('/_authed/items/$id/edit')({
  // El router convierte el parámetro a número una sola vez; Link lo pide tipado ({ id: 1 }).
  params: {
    parse: ({ id }) => ({ id: Number(id) }),
    stringify: ({ id }) => ({ id: String(id) }),
  },
  // Usa la caché del listado (ensureQueryData solo pide si no hay datos): entrar desde el muro es instantáneo.
  loader: async ({ context, params }) => {
    const items = await context.queryClient.ensureQueryData(itemsQueryOptions)
    const item = items.find((it) => it.id === params.id)
    if (!item) throw notFound()
    return { item }
  },
  head: ({ loaderData }) =>
    seo({ title: loaderData ? `Editar «${loaderData.item.title}»` : 'Editar', description: 'Edita un favorito.' }),
  notFoundComponent: ItemGone,
  component: EditRoute,
})

function EditRoute() {
  const { item } = Route.useLoaderData()
  const { user } = Route.useRouteContext()
  return item.created_by === user.sub ? <EditItemPage key={item.id} item={item} /> : <NotYourItem item={item} />
}
