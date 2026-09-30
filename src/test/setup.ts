import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from './server'

// jsdom no implementa scrollTo (el router lo usa al navegar).
window.scrollTo = (() => {}) as typeof window.scrollTo

// onUnhandledRequest: 'error' → cualquier request que un test no esperaba lo hace fallar.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  cleanup()
  server.resetHandlers()
  sessionStorage.clear()
})
afterAll(() => server.close())
