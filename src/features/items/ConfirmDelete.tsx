import { useEffect, useId, useRef } from 'react'

// ConfirmDelete: <dialog> modal nativo (foco atrapado, Escape cierra). El foco inicial cae en
// "Cancelar": en una acción destructiva, lo seguro es lo que está a un Enter de distancia.
export function ConfirmDelete({ title, onConfirm, onCancel }: { title: string; onConfirm: () => void; onCancel: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const headingId = useId()

  useEffect(() => {
    const dialog = ref.current
    dialog?.showModal()
    return () => dialog?.removeAttribute('open')
  }, [])

  return (
    <dialog ref={ref} className="dialog" aria-labelledby={headingId} onClose={onCancel}>
      <h2 id={headingId}>¿Eliminar «{title}»?</h2>
      <p className="muted">Desaparece de tu muro para siempre; no se puede deshacer.</p>
      <div className="dialog-actions">
        <button type="button" className="button secondary" onClick={() => ref.current?.close()}>
          Cancelar
        </button>
        <button type="button" className="danger" onClick={onConfirm}>
          Eliminar
        </button>
      </div>
    </dialog>
  )
}
