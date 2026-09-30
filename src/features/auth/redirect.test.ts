import { expect, test } from 'vitest'
import { DEFAULT_REDIRECT, safeRedirect } from './redirect'

test.each([
  ['/items/new', '/items/new'],
  ['/dashboard?x=1', '/dashboard?x=1'],
  ['https://evil.com', DEFAULT_REDIRECT],
  ['//evil.com', DEFAULT_REDIRECT],
  ['/\\evil.com', DEFAULT_REDIRECT],
  ['javascript:alert(1)', DEFAULT_REDIRECT],
  ['', DEFAULT_REDIRECT],
  [undefined, DEFAULT_REDIRECT],
  [42, DEFAULT_REDIRECT],
])('safeRedirect(%j) → %s', (input, expected) => {
  expect(safeRedirect(input)).toBe(expected)
})
