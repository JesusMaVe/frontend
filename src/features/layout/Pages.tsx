import { useIsFetching } from '@tanstack/react-query'
import { type ErrorComponentProps, Link, useRouter, useRouterState } from '@tanstack/react-router'

function GhostMark({ mark }: { mark: string }) {
  return (
    <div className="monogram" data-tone="ghost" aria-hidden="true">
      <span>{mark}</span>
    </div>
  )
}

// ProgressBar: una línea fina arriba mientras el router resuelve una navegación o Query trae datos.
export function ProgressBar() {
  const navigating = useRouterState({ select: (s) => s.status === 'pending' })
  const fetching = useIsFetching() > 0
  return <div className="progress" data-active={navigating || fetching} aria-hidden="true" />
}

export function NotFoundPage() {
  return (
    <main id="contenido" className="state-page">
      <GhostMark mark="?" />
      <h1 className="display">Página no encontrada</h1>
      <p className="muted">Esta dirección no lleva a ningún lado. Revisa el enlace o vuelve a tus elementos.</p>
      <Link to="/" className="button">
        Volver al inicio
      </Link>
    </main>
  )
}

export function ErrorPage({ reset }: ErrorComponentProps) {
  const router = useRouter()
  const retry = () => {
    reset()
    void router.invalidate()
  }
  return (
    <main id="contenido" className="state-page">
      <GhostMark mark="!" />
      <h1 className="display">No se pudo cargar esta página</h1>
      <p className="muted">Revisa tu conexión y vuelve a intentarlo.</p>
      <button type="button" onClick={retry}>
        Reintentar
      </button>
    </main>
  )
}
