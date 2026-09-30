import { describe, expect, test } from 'vitest'
import { devServer } from './vite.dev.ts'

const env = { WEB_PORT: '5173', AUTH_SVC_URL: 'http://127.0.0.1:8081', API_URL: 'http://127.0.0.1:8082' }

describe('devServer', () => {
  test('escucha solo en 127.0.0.1 con el puerto del .env', () => {
    const s = devServer(env)
    expect(s.host).toBe('127.0.0.1')
    expect(s.port).toBe(5173)
    expect(s.strictPort).toBe(true)
  })

  test('/auth va a auth-svc sin el prefijo y /api va a la API', () => {
    const { proxy } = devServer(env)
    expect(proxy['/auth'].target).toBe('http://127.0.0.1:8081')
    expect(proxy['/auth'].rewrite?.('/auth/token')).toBe('/token')
    expect(proxy['/api'].target).toBe('http://127.0.0.1:8082')
    expect(proxy['/api'].rewrite).toBeUndefined()
  })

  test.each(Object.keys(env))('sin %s falla nombrando la variable', (key) => {
    const partial: Record<string, string> = { ...env }
    delete partial[key]
    expect(() => devServer(partial)).toThrow(key)
  })
})
