export const SITE_NAME = 'Mis favoritos'

type Seo = { title?: string; description: string; index?: boolean }

// seo arma el `head` de una ruta de TanStack Router: <HeadContent /> (en __root) lo pinta y, al
// navegar, la ruta más profunda gana. Las rutas privadas van con noindex: no hay nada que indexar.
export function seo({ title, description, index = false }: Seo) {
  const fullTitle = title ? `${title} · ${SITE_NAME}` : SITE_NAME
  return {
    meta: [
      { title: fullTitle },
      { name: 'description', content: description },
      { name: 'robots', content: index ? 'index, follow' : 'noindex, nofollow' },
      { property: 'og:title', content: fullTitle },
      { property: 'og:description', content: description },
      { name: 'twitter:title', content: fullTitle },
      { name: 'twitter:description', content: description },
    ],
  }
}
