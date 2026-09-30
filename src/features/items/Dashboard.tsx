import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { itemsQueryOptions } from './api'

const dateFormat = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' })

export function Dashboard() {
  const items = useQuery(itemsQueryOptions)
  return (
    <main className="card">
      <h2>Tus elementos</h2>
      <p>
        <Link to="/items/new" className="button">
          Agregar
        </Link>
      </p>
      {items.isPending && <p>Cargando…</p>}
      {items.isError && (
        <p role="alert" className="error">
          No se pudo cargar el listado.
        </p>
      )}
      {items.isSuccess && items.data.length === 0 && <p>Todavía no agregaste nada.</p>}
      {items.isSuccess && items.data.length > 0 && (
        <ul className="items">
          {items.data.map((it) => (
            <li key={it.id}>
              <strong>{it.title}</strong>
              {it.description && <p>{it.description}</p>}
              <span className="meta">
                por {it.created_by} · {dateFormat.format(new Date(it.created_at))}
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
