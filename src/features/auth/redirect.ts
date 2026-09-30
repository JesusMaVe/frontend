export const DEFAULT_REDIRECT = '/dashboard'

// safeRedirect solo acepta rutas internas ("/algo"); "//host" o "/\host" las trataría el navegador
// como otro origen (open redirect).
export function safeRedirect(value: unknown): string {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) {
    return DEFAULT_REDIRECT
  }
  return value
}
