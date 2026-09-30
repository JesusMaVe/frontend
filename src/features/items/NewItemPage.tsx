import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { type FormEvent, useState } from 'react'
import { ApiError } from '../../api/client'
import { createItem, type ItemInput, itemsQueryOptions } from './api'
import { type FieldErrors, serverFieldErrors, validateItem } from './schema'

export function NewItemPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [values, setValues] = useState<ItemInput>({ title: '', description: '' })
  const [errors, setErrors] = useState<FieldErrors>({})
  const create = useMutation({
    mutationFn: createItem,
    onSuccess: async () => {
      // El listado se vuelve a pedir: el item nuevo aparece al volver al dashboard.
      await queryClient.invalidateQueries({ queryKey: itemsQueryOptions.queryKey })
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
    if (Object.keys(found).length === 0) create.mutate(input)
  }

  const genericError = create.isError && !(create.error instanceof ApiError && create.error.status === 400)

  return (
    <main className="card">
      <h2>Agregar un elemento</h2>
      <form onSubmit={submit} noValidate>
        <label>
          Título
          <input
            name="title"
            value={values.title}
            aria-invalid={errors.title ? true : undefined}
            aria-describedby={errors.title ? 'title-error' : undefined}
            onChange={(e) => setValues({ ...values, title: e.target.value })}
          />
        </label>
        {errors.title && (
          <p id="title-error" className="error">
            {errors.title}
          </p>
        )}
        <label>
          Descripción
          <textarea
            name="description"
            rows={3}
            value={values.description}
            aria-invalid={errors.description ? true : undefined}
            aria-describedby={errors.description ? 'description-error' : undefined}
            onChange={(e) => setValues({ ...values, description: e.target.value })}
          />
        </label>
        {errors.description && (
          <p id="description-error" className="error">
            {errors.description}
          </p>
        )}
        {genericError && (
          <p role="alert" className="error">
            No se pudo guardar. Intenta de nuevo.
          </p>
        )}
        <div className="actions">
          <button type="submit" disabled={create.isPending}>
            {create.isPending ? 'Guardando…' : 'Guardar'}
          </button>
          <Link to="/dashboard" className="button secondary">
            Cancelar
          </Link>
        </div>
      </form>
    </main>
  )
}
