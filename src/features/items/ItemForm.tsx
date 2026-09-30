import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { type FormEvent, type ReactNode, useState } from 'react'
import { ApiError } from '../../api/client'
import { ArrowLeftIcon } from '../layout/icons'
import { type ItemInput, itemsQueryOptions } from './api'
import { chars, type FieldErrors, limits, serverFieldErrors, validateItem } from './schema'
import { Tile } from './Tile'

function Remaining({ id, value, max }: { id: string; value: string; max: number }) {
  const left = max - chars(value.trim())
  return (
    <span id={id} className="counter" data-over={left < 0}>
      {left} restantes
    </span>
  )
}

function saveError(err: unknown): string | null {
  if (!(err instanceof ApiError)) return 'No se pudo guardar. Intenta de nuevo.'
  if (err.status === 400) return null // se muestran por campo
  if (err.status === 403) return 'Solo quien agregó este elemento puede cambiarlo.'
  if (err.status === 404) return 'Este elemento ya no existe; alguien lo eliminó.'
  return 'No se pudo guardar. Intenta de nuevo.'
}

type ItemFormProps = {
  heading: string
  intro: string
  initial: ItemInput
  save: (input: ItemInput) => Promise<unknown>
  submitLabel: string
  pendingLabel: string
  // Acciones secundarias bajo el formulario (p. ej. "Eliminar elemento" al editar).
  extra?: ReactNode
}

// ItemForm: el formulario de alta y de edición. Al guardar revalida el listado y vuelve al muro.
export function ItemForm({ heading, intro, initial, save, submitLabel, pendingLabel, extra }: ItemFormProps) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [values, setValues] = useState<ItemInput>(initial)
  const [errors, setErrors] = useState<FieldErrors>({})
  const mutation = useMutation({
    mutationFn: save,
    onSuccess: async () => {
      // refetchType 'all': el listado (inactivo en esta página) se vuelve a pedir y se ESPERA antes de
      // navegar, así el dashboard nunca pinta la lista vieja de la caché.
      await queryClient.invalidateQueries({ queryKey: itemsQueryOptions.queryKey, refetchType: 'all' })
      await navigate({ to: '/dashboard' })
    },
    onError: (err) => {
      if (err instanceof ApiError && err.status === 400) setErrors(serverFieldErrors(err.body))
    },
  })

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const input = { title: values.title.trim(), description: values.description.trim() }
    const found = validateItem(input)
    setErrors(found)
    if (Object.keys(found).length === 0) mutation.mutate(input)
  }

  const error = mutation.isError ? saveError(mutation.error) : null
  const describedBy = (field: keyof ItemInput) => [errors[field] && `${field}-error`, `${field}-counter`].filter(Boolean).join(' ')

  return (
    <div className="compose">
      <div className="compose-head">
        <Link to="/dashboard" className="back">
          <ArrowLeftIcon />
          Tus elementos
        </Link>
        <h1 className="display">{heading}</h1>
        <p className="muted">{intro}</p>
      </div>

      <div className="compose-main">
        <form className="compose-form" onSubmit={submit} noValidate>
          <div className="field">
            <div className="field-label">
              <label htmlFor="title">Título</label>
              <Remaining id="title-counter" value={values.title} max={limits.title} />
            </div>
            <input
              id="title"
              name="title"
              autoFocus
              value={values.title}
              aria-invalid={errors.title ? true : undefined}
              aria-describedby={describedBy('title')}
              onChange={(e) => setValues({ ...values, title: e.target.value })}
            />
            {errors.title && (
              <p id="title-error" className="error">
                {errors.title}
              </p>
            )}
          </div>
          <div className="field">
            <div className="field-label">
              <label htmlFor="description">Descripción</label>
              <Remaining id="description-counter" value={values.description} max={limits.description} />
            </div>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={values.description}
              aria-invalid={errors.description ? true : undefined}
              aria-describedby={describedBy('description')}
              onChange={(e) => setValues({ ...values, description: e.target.value })}
            />
            {errors.description && (
              <p id="description-error" className="error">
                {errors.description}
              </p>
            )}
          </div>
          {error && (
            <p role="alert" className="error banner">
              {error}
            </p>
          )}
          <div className="form-actions">
            <Link to="/dashboard" className="button secondary">
              Cancelar
            </Link>
            <button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? pendingLabel : submitLabel}
            </button>
          </div>
        </form>
        {extra}
      </div>

      <figure className="compose-preview" aria-label="Vista previa">
        <div className="tile">
          <Tile title={values.title.trim()} description={values.description.trim()} placeholder="Tu nuevo favorito" />
        </div>
        <figcaption className="muted">Así se verá en tu muro.</figcaption>
      </figure>
    </div>
  )
}
