import { Link } from '@tanstack/react-router'
import type { Claims } from '../auth/token'
import { StarIcon } from './icons'
import { SITE_NAME } from './seo'

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((p) => [...p][0]?.toUpperCase() ?? '').join('')
}

function Wordmark() {
  return (
    <span className="wordmark">
      <StarIcon />
      {SITE_NAME}
    </span>
  )
}

export function AppHeader({ user, onLogout }: { user: Claims; onLogout: () => void }) {
  const name = user.name ?? user.sub
  return (
    <header className="app-header">
      <Link to="/dashboard" className="wordmark-link" aria-label={`${SITE_NAME}, inicio`}>
        <Wordmark />
      </Link>
      <nav aria-label="Principal" className="nav">
        {/* activeProps: el router marca el enlace de la ruta actual (y agrega aria-current="page"). */}
        <Link to="/dashboard" activeProps={{ className: 'active' }}>
          Elementos
        </Link>
      </nav>
      <div className="user">
        <span className="avatar" aria-hidden="true">
          {initials(name)}
        </span>
        <span className="user-name">{name}</span>
        <button type="button" className="text-button" onClick={onLogout}>
          Cerrar sesión
        </button>
      </div>
    </header>
  )
}
