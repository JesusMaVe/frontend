import { QueryClient } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app'
import { makeRouter } from './router'
// Fuente autoalojada (la CSP solo permite 'self'): pesos 200–800 y ancho 75–100 %.
import '@fontsource-variable/bricolage-grotesque/wdth.css'
import './styles.css'

// staleTime: volver a una página o precargarla no repite el GET si los datos tienen < 30 s.
const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } })
const router = makeRouter(queryClient)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App router={router} queryClient={queryClient} />
  </StrictMode>,
)
