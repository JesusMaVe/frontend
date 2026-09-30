import type { ProxyOptions } from 'vite'

// devServer arma el dev server de Vite desde .env: solo en 127.0.0.1 y con un único origen
// para el navegador (/auth → auth-svc, /api → api), así no hace falta CORS.
export function devServer(env: Record<string, string>) {
  const need = (key: string): string => {
    const value = env[key]
    if (!value) throw new Error(`falta ${key} en .env (créalo con: make env)`)
    return value
  }
  const proxy: Record<string, ProxyOptions> = {
    '/auth': { target: need('AUTH_SVC_URL'), changeOrigin: true, rewrite: (path) => path.replace(/^\/auth/, '') },
    '/api': { target: need('API_URL'), changeOrigin: true },
  }
  return { host: '127.0.0.1', port: Number(need('WEB_PORT')), strictPort: true, proxy }
}
