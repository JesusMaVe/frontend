// Los favoritos no tienen imagen: cada uno se representa con su inicial (monograma) sobre un tono
// de la paleta. El tono sale del título, así la vista previa de /items/new coincide con el muro.
export const TONES = ['verdigris', 'plum', 'slate', 'brass', 'moss'] as const
export type Tone = (typeof TONES)[number]

const graphemes = new Intl.Segmenter('es', { granularity: 'grapheme' })

export function monogram(title: string): string {
  const first = graphemes.segment(title.trim())[Symbol.iterator]().next()
  return first.done ? '★' : first.value.segment.toLocaleUpperCase('es')
}

export function toneFor(title: string): Tone {
  let hash = 0
  for (const ch of title.trim().toLocaleLowerCase('es')) hash = (hash * 31 + ch.codePointAt(0)!) >>> 0
  return TONES[hash % TONES.length]
}
