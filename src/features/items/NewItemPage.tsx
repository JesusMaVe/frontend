import { createItem } from './api'
import { ItemForm } from './ItemForm'

export function NewItemPage() {
  return (
    <ItemForm
      heading="Agregar un elemento"
      intro="Dale un título claro: su inicial será la portada en tu muro. La descripción es opcional."
      initial={{ title: '', description: '' }}
      save={createItem}
      submitLabel="Guardar"
      pendingLabel="Guardando…"
    />
  )
}
