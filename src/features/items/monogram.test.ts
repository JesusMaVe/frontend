import { expect, test } from 'vitest'
import { monogram, TONES, toneFor } from './monogram'

test('monogram toma la primera letra en mayúscula, sin partir emojis ni acentos', () => {
  expect(monogram('zelda')).toBe('Z')
  expect(monogram('  ñandú')).toBe('Ñ')
  expect(monogram('🗡️ espada')).toBe('🗡️')
  expect(monogram('')).toBe('★')
})

test('toneFor es estable para el mismo título y siempre devuelve un tono válido', () => {
  expect(toneFor('Zelda')).toBe(toneFor('Zelda'))
  expect(toneFor(' Zelda ')).toBe(toneFor('Zelda'))
  for (const t of ['a', 'Dune', 'Café de especialidad', '']) expect(TONES).toContain(toneFor(t))
  expect(new Set(['Zelda', 'Dune', 'Mario', 'Café', 'Halo', 'Tetris'].map(toneFor)).size).toBeGreaterThan(1)
})
