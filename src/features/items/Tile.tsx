import type { ReactNode } from 'react'
import { monogram, toneFor } from './monogram'

const dateFormat = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' })

// Monogram: la inicial del título, enorme y recortada, sobre el tono del favorito. Es decorativa:
// el título real va debajo como texto.
export function Monogram({ title }: { title: string }) {
  return (
    <div className="monogram" data-tone={toneFor(title)} aria-hidden="true">
      <span>{monogram(title)}</span>
    </div>
  )
}

type TileProps = { title: string; description: string; placeholder?: string; footer?: ReactNode }

export function Tile({ title, description, placeholder, footer }: TileProps) {
  return (
    <>
      <Monogram title={title} />
      <div className="tile-body">
        <h2 className="tile-title" data-placeholder={!title || undefined}>
          {title || placeholder}
        </h2>
        {description && <p className="tile-description">{description}</p>}
        {footer}
      </div>
    </>
  )
}

export function AddedBy({ by, at }: { by: string; at: string }) {
  return (
    <p className="tile-meta">
      Agregado por {by}, <time dateTime={at}>{dateFormat.format(new Date(at))}</time>
    </p>
  )
}
