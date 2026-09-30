import { useMutation } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { type FormEvent, useState } from 'react'
import { api, ApiError } from '../../api/client'
import { safeRedirect } from './redirect'
import { setToken } from './token'

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
    <main className="card">
      <h2>Iniciar sesión</h2>
      <form onSubmit={submit}>
        <label>
          Usuario
          <input name="username" autoComplete="username" required value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>
        <label>
          Contraseña
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {login.isError && (
          <p role="alert" className="error">
            {errorMessage(login.error)}
          </p>
        )}
        <button type="submit" disabled={login.isPending}>
          {login.isPending ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </main>
  )
}
