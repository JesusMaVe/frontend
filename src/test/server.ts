import { setupServer } from 'msw/node'

// Un solo servidor MSW para todos los tests; cada test agrega sus handlers con server.use(...).
export const server = setupServer()
