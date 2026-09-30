import { Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { type Item, updateItem } from './api'
import { ConfirmDelete } from './ConfirmDelete'
import { ItemForm } from './ItemForm'
import { useDeleteItem } from './useDeleteItem'

export function EditItemPage({ item }: { item: Item }) {
  const navigate = useNavigate()
  const remove = useDeleteItem()
  const [confirming, setConfirming] = useState(false)

  const confirm = () => {
    setConfirming(false)
    remove.mutate(item, { onSuccess: () => void navigate({ to: '/dashboard' }) })
  }

  return (
    <>
      <ItemForm
        heading={`Editar «${item.title}»`}
        intro="Los cambios se ven en tu muro en cuanto guardas."
        initial={{ title: item.title, description: item.description }}
        save={(input) => updateItem(item.id, input)}
        submitLabel="Guardar cambios"
        pendingLabel="Guardando…"
        extra={
          <div className="danger-zone">
            <div>
              <p className="danger-zone-title">Eliminar este elemento</p>
              <p className="muted">Sale de tu muro para siempre.</p>
            </div>
            <button type="button" className="button secondary danger-outline" onClick={() => setConfirming(true)} disabled={remove.isPending}>
              Eliminar elemento
            </button>
            {remove.isError && (
              <p role="alert" className="error banner">
                No se pudo eliminar «{item.title}». Inténtalo de nuevo.
              </p>
            )}
          </div>
        }
      />
      {confirming && <ConfirmDelete title={item.title} onConfirm={confirm} onCancel={() => setConfirming(false)} />}
    </>
  )
}

export function NotYourItem({ item }: { item: Item }) {
  return (
    <div className="notice">
      <h1 className="display">No puedes editar «{item.title}»</h1>
      <p className="muted">Lo agregó {item.created_by}. Solo {item.created_by} puede editarlo o eliminarlo.</p>
      <Link to="/dashboard" className="button">
        Volver a tus elementos
      </Link>
    </div>
  )
}

export function ItemGone() {
  return (
    <div className="notice">
      <h1 className="display">Este elemento ya no existe</h1>
      <p className="muted">Puede que lo hayan eliminado. Tu muro tiene la lista al día.</p>
      <Link to="/dashboard" className="button">
        Volver a tus elementos
      </Link>
    </div>
  )
}
