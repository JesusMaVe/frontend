import type { ItemInput } from './api'

function positiveInt(name: string, raw: string | undefined): number {
  const n = Number(raw)
  if (!Number.isInteger(n) || n < 1) throw new Error(`${name} debe ser un entero positivo (ver .env)`)
  return n
}

// Los mismos límites que la API (ITEM_TITLE_MAX / ITEM_DESCRIPTION_MAX del repo api), desde .env.
export const limits = {
  title: positiveInt('VITE_ITEM_TITLE_MAX', import.meta.env.VITE_ITEM_TITLE_MAX),
  description: positiveInt('VITE_ITEM_DESCRIPTION_MAX', import.meta.env.VITE_ITEM_DESCRIPTION_MAX),
}

export type FieldErrors = Partial<Record<keyof ItemInput, string>>

// Cuenta puntos de código, igual que utf8.RuneCountInString en la API (un emoji = 1).
export const chars = (s: string): number => [...s].length

export function validateItem({ title, description }: ItemInput): FieldErrors {
  const errors: FieldErrors = {}
  const t = title.trim()
  if (t === '') errors.title = 'El título es obligatorio'
  else if (chars(t) > limits.title) errors.title = `Máximo ${limits.title} caracteres`
  if (chars(description.trim()) > limits.description) errors.description = `Máximo ${limits.description} caracteres`
  return errors
}

export function serverFieldErrors(body: unknown): FieldErrors {
  if (typeof body !== 'object' || body === null) return {}
  const fields = (body as { fields?: unknown }).fields
  if (typeof fields !== 'object' || fields === null) return {}
  const errors: FieldErrors = {}
  for (const key of ['title', 'description'] as const) {
    const msg = (fields as Record<string, unknown>)[key]
    if (typeof msg === 'string') errors[key] = msg
  }
  return errors
}
