import { expect, test } from 'vitest'
import { limits, serverFieldErrors, validateItem } from './schema'

test('los límites salen del .env', () => {
  expect(limits).toEqual({ title: 20, description: 50 })
})

test.each([
  ['válido', { title: 'Zelda', description: '' }, {}],
  ['título vacío', { title: '', description: 'x' }, { title: 'El título es obligatorio' }],
  ['título solo espacios', { title: '   ', description: '' }, { title: 'El título es obligatorio' }],
  ['título largo', { title: 'a'.repeat(21), description: '' }, { title: 'Máximo 20 caracteres' }],
  ['emojis cuentan como un carácter (igual que la API)', { title: '🎮'.repeat(20), description: '' }, {}],
  ['descripción larga', { title: 'Zelda', description: 'a'.repeat(51) }, { description: 'Máximo 50 caracteres' }],
])('%s', (_name, input, expected) => {
  expect(validateItem(input)).toEqual(expected)
})

test('serverFieldErrors toma los errores por campo de un 400 de la API', () => {
  expect(serverFieldErrors({ error: 'validation failed', fields: { title: 'es obligatorio' } })).toEqual({
    title: 'es obligatorio',
  })
  expect(serverFieldErrors({ error: 'invalid request' })).toEqual({})
  expect(serverFieldErrors(null)).toEqual({})
})
