import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { PlusIcon, SearchIcon } from '../layout/icons'
import { type Item, itemsQueryOptions } from './api'
import { ConfirmDelete } from './ConfirmDelete'
import { AddedBy, Tile } from './Tile'
import { useDeleteItem } from './useDeleteItem'

const normalize = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

// matches: búsqueda sin distinguir mayúsculas ni acentos ("cafe" encuentra "Café").
function matches(item: Item, query: string): boolean {
  const q = normalize(query.trim())
  return q === '' || normalize(`${item.title} ${item.description}`).includes(q)
}

function countLabel(shown: number, total: number): string {
  const noun = total === 1 ? 'elemento' : 'elementos'
  return shown === total ? `${total} ${noun}` : `${shown} de ${total} ${noun}`
}

type DashboardProps = { me: string; query: string; onQueryChange: (q: string) => void }

export function Dashboard({ me, query, onQueryChange }: DashboardProps) {
  const items = useQuery(itemsQueryOptions)
  const visible = items.isSuccess ? items.data.filter((it) => matches(it, query)) : []
  const remove = useDeleteItem()
  const [confirming, setConfirming] = useState<Item | null>(null)

  const confirmDelete = () => {
    if (confirming) remove.mutate(confirming)
    setConfirming(null)
  }

  return (
    <>
      <div className="page-head">
        <h1 className="display">Tus elementos</h1>
        {items.isSuccess && <p className="count">{countLabel(visible.length, items.data.length)}</p>}
      </div>

      <div className="toolbar">
        <div className="search" role="search">
          <SearchIcon />
          <input
            type="search"
            aria-label="Buscar"
            placeholder="Buscar por título o descripción"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
          />
        </div>
        <Link to="/items/new" className="button">
          <PlusIcon />
          Agregar
        </Link>
      </div>

      {items.isPending && (
        <div aria-busy="true">
          <p className="sr-only">Cargando…</p>
          <ul className="wall" aria-hidden="true">
            {[0, 1, 2, 3].map((n) => (
              <li key={n} className="tile skeleton">
                <div className="monogram" />
                <span className="bone bone-title" />
                <span className="bone" />
              </li>
            ))}
          </ul>
        </div>
      )}

      {remove.isError && (
        <p role="alert" className="error banner">
          No se pudo eliminar «{remove.variables.title}». Inténtalo de nuevo.
        </p>
      )}

      {items.isError && (
        <p role="alert" className="error banner">
          No se pudo cargar el listado. Recarga la página para intentarlo de nuevo.
        </p>
      )}

      {items.isSuccess && items.data.length === 0 && (
        <div className="empty">
          <div className="monogram" data-tone="ghost" aria-hidden="true">
            <span>★</span>
          </div>
          <div>
            <p className="empty-title">Todavía no agregaste nada.</p>
            <p className="muted">Usa «Agregar» para guardar tu primer favorito; aparecerá aquí con su inicial.</p>
          </div>
        </div>
      )}

      {items.isSuccess && items.data.length > 0 && visible.length === 0 && (
        <div className="empty">
          <div className="monogram" data-tone="ghost" aria-hidden="true">
            <span>?</span>
          </div>
          <div>
            <p className="empty-title">Nada coincide con «{query.trim()}».</p>
            <p className="muted">Prueba con otra palabra o borra la búsqueda.</p>
          </div>
        </div>
      )}

      {visible.length > 0 && (
        <ul className="wall">
          {visible.map((it) => (
            <li key={it.id} className="tile">
              <Tile
                title={it.title}
                description={it.description}
                footer={
                  <>
                    <AddedBy by={it.created_by} at={it.created_at} />
                    {it.created_by === me && (
                      <div className="tile-actions">
                        <Link to="/items/$id/edit" params={{ id: it.id }} aria-label={`Editar ${it.title}`}>
                          Editar
                        </Link>
                        <button type="button" className="link-button" aria-label={`Eliminar ${it.title}`} onClick={() => setConfirming(it)}>
                          Eliminar
                        </button>
                      </div>
                    )}
                  </>
                }
              />
            </li>
          ))}
        </ul>
      )}

      {confirming && <ConfirmDelete title={confirming.title} onConfirm={confirmDelete} onCancel={() => setConfirming(null)} />}
    </>
  )
}
