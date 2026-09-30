import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from './server'

// jsdom no implementa scrollTo (el router lo usa al navegar).
window.scrollTo = (() => {}) as typeof window.scrollTo

// jsdom no implementa <dialog>.showModal()/close() (la confirmación de borrado los usa).
HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
  this.setAttribute('open', '')
}
HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
  this.removeAttribute('open')
  this.dispatchEvent(new Event('close'))
}

// onUnhandledRequest: 'error' → cualquier request que un test no esperaba lo hace fallar.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  cleanup()
  server.resetHandlers()
  sessionStorage.clear()
})
afterAll(() => server.close())
