import { useMutation } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { type FormEvent, useState } from 'react'
import { api, ApiError } from '../../api/client'
import { Monogram } from '../items/Tile'
import { safeRedirect } from './redirect'
import { setToken } from './token'

// Muestra decorativa del muro: así se ven los favoritos una vez dentro.
const SAMPLE_TITLES = ['Zelda', 'Dune', 'Café', 'Jazz', 'Kioto', 'Bach', 'Ulises', 'Mole', 'Halo']

function errorMessage(err: unknown): string {
  if (err instanceof ApiError && err.status === 401) return 'Usuario o contraseña incorrectos'
  if (err instanceof ApiError && err.status === 429) return 'Demasiados intentos. Espera un minuto.'
  return 'No se pudo iniciar sesión. Intenta de nuevo.'
}

export function LoginPage({ redirect }: { redirect?: string }) {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const login = useMutation({
    // POST /auth/token: el proxy lo manda a auth-svc (POST /token), que devuelve el JWT.
    mutationFn: () => api<{ token: string }>('/auth/token', { method: 'POST', body: { username, password } }),
    onSuccess: ({ token }) => {
      setToken(token)
      router.history.push(safeRedirect(redirect))
    },
  })

  const submit = (e: FormEvent) => {
    e.preventDefault()
    login.mutate()
  }

  return (
    <main id="contenido" className="auth">
      <section className="auth-showcase" aria-hidden="true">
        <div className="showcase-wall">
          {SAMPLE_TITLES.map((t) => (
            <Monogram key={t} title={t} />
          ))}
        </div>
      </section>
      <section className="auth-panel">
        <div className="auth-copy">
          <h1 className="display">Mis favoritos</h1>
          <p className="lead">Lo que te gusta, en un solo lugar: guárdalo una vez y encuéntralo cuando lo busques.</p>
        </div>
        <form onSubmit={submit} aria-labelledby="login-title">
          <h2 id="login-title">Iniciar sesión</h2>
          <div className="field">
            <label htmlFor="username">Usuario</label>
            <input
              id="username"
              name="username"
              autoComplete="username"
              autoFocus
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {login.isError && (
            <p role="alert" className="error banner">
              {errorMessage(login.error)}
            </p>
          )}
          <button type="submit" className="block" disabled={login.isPending}>
            {login.isPending ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  )
}
