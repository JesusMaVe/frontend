const b64url = (value: unknown): string => {
  const bytes = new TextEncoder().encode(JSON.stringify(value))
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

// fakeJwt arma un JWT con la forma del de auth-svc (la firma no importa: el front no la verifica).
export function fakeJwt(claims: Record<string, unknown> = {}): string {
  const payload = {
    sub: 'alice',
    name: 'Alice Example',
    email: 'alice@example.org',
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...claims,
  }
  return `${b64url({ alg: 'EdDSA', typ: 'JWT' })}.${b64url(payload)}.firma-falsa`
}
