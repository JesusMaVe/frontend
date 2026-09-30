import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteItem, type Item, itemsQueryOptions } from './api'

// useDeleteItem borra de forma optimista: la ficha sale de la caché al instante y, si la API
// falla, vuelve la lista anterior. Al terminar (bien o mal) se revalida contra el servidor.
export function useDeleteItem() {
  const queryClient = useQueryClient()
  const { queryKey } = itemsQueryOptions
  return useMutation({
    mutationFn: (item: Item) => deleteItem(item.id),
    onMutate: async (item) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData(queryKey)
      queryClient.setQueryData(queryKey, (old) => old?.filter((it) => it.id !== item.id))
      return { previous }
    },
    onError: (_err, _item, result) => {
      if (result?.previous) queryClient.setQueryData(queryKey, result.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  })
}
