import { describe, expect, test } from 'vitest'
import { fakeJwt } from '../../test/jwt'
import { clearToken, currentUser, decodeJwtPayload, getToken, isExpired, setToken } from './token'

describe('token store', () => {
  test('guarda en sessionStorage y nunca en localStorage', () => {
    setToken('t1')
    expect(getToken()).toBe('t1')
    expect(sessionStorage.length).toBe(1)
    expect(localStorage.length).toBe(0)
    clearToken()
    expect(getToken()).toBeNull()
  })
})

describe('decodeJwtPayload', () => {
  test('lee sub, name, email y exp', () => {
    const c = decodeJwtPayload(fakeJwt({ exp: 2000000000 }))
    expect(c).toEqual({ sub: 'alice', name: 'Alice Example', email: 'alice@example.org', exp: 2000000000 })
  })

  test('decodifica UTF-8 (acentos en el nombre)', () => {
    expect(decodeJwtPayload(fakeJwt({ name: 'Ñoño Pérez' }))?.name).toBe('Ñoño Pérez')
  })

  test.each([
    ['sin puntos', 'basura'],
    ['payload no es base64', 'a.@@@.c'],
    ['payload no es JSON', `a.${btoa('hola')}.c`],
    ['sin sub', fakeJwt({ sub: undefined })],
    ['exp no numérico', fakeJwt({ exp: 'mañana' })],
  ])('%s → null', (_name, token) => {
    expect(decodeJwtPayload(token)).toBeNull()
  })
})

describe('expiración', () => {
  test('isExpired compara exp (segundos) con el reloj (ms)', () => {
    expect(isExpired({ sub: 'a', exp: 100 }, 99_000)).toBe(false)
    expect(isExpired({ sub: 'a', exp: 100 }, 100_000)).toBe(true)
  })

  test('currentUser: claims si el token es válido, null si expiró o no hay', () => {
    expect(currentUser()).toBeNull()
    setToken(fakeJwt())
    expect(currentUser()?.sub).toBe('alice')
    setToken(fakeJwt({ exp: Math.floor(Date.now() / 1000) - 1 }))
    expect(currentUser()).toBeNull()
  })
})
