// El JWT de auth-svc vive en sessionStorage: sobrevive a recargar la pestaña y se borra al
// cerrarla. Nunca en localStorage (persistiría entre sesiones del navegador).
const KEY = 'auth.token'

export type Claims = { sub: string; name?: string; email?: string; exp: number }

export function getToken(): string | null {
  return sessionStorage.getItem(KEY)
}

export function setToken(token: string): void {
  sessionStorage.setItem(KEY, token)
}

export function clearToken(): void {
  sessionStorage.removeItem(KEY)
}

// decodeJwtPayload lee el payload SIN verificar la firma: solo sirve para mostrar el usuario y
// saber si ya expiró. Quien valida el token de verdad es la API.
export function decodeJwtPayload(token: string): Claims | null {
  const part = token.split('.')[1]
  if (!part) return null
  try {
    const b64 = part.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(part.length / 4) * 4, '=')
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
    const data: unknown = JSON.parse(new TextDecoder().decode(bytes))
    if (typeof data !== 'object' || data === null) return null
    const { sub, exp, name, email } = data as Record<string, unknown>
    if (typeof sub !== 'string' || sub === '' || typeof exp !== 'number') return null
    return {
      sub,
      exp,
      name: typeof name === 'string' ? name : undefined,
      email: typeof email === 'string' ? email : undefined,
    }
  } catch {
    return null
  }
}

export function isExpired(claims: Claims, nowMs: number = Date.now()): boolean {
  return claims.exp * 1000 <= nowMs
}

// currentUser devuelve las claims del token guardado si existe y no expiró.
export function currentUser(nowMs: number = Date.now()): Claims | null {
  const token = getToken()
  const claims = token ? decodeJwtPayload(token) : null
  return claims && !isExpired(claims, nowMs) ? claims : null
}
