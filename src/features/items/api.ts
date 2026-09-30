import { queryOptions } from '@tanstack/react-query'
import { api } from '../../api/client'

export type Item = { id: number; title: string; description: string; created_by: string; created_at: string }
export type ItemInput = { title: string; description: string }

export const itemsQueryOptions = queryOptions({
  queryKey: ['items'],
  queryFn: async () => (await api<{ items: Item[] }>('/api/items')).items,
})

export function createItem(input: ItemInput): Promise<Item> {
  return api<Item>('/api/items', { method: 'POST', body: input })
}

export function updateItem(id: number, input: ItemInput): Promise<Item> {
  return api<Item>(`/api/items/${id}`, { method: 'PUT', body: input })
}

export async function deleteItem(id: number): Promise<void> {
  await api<null>(`/api/items/${id}`, { method: 'DELETE' })
}
