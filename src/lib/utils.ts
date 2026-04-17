import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge Tailwind classes safely (clsx + tailwind-merge) */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format price in ARS (Argentine Peso) */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

/** Format date to readable string */
export function formatDate(
  date: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  })
}

/** Format date to relative time */
export function formatRelativeDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Ahora'
  if (diffMins < 60) return `Hace ${diffMins} min`
  if (diffHours < 24) return `Hace ${diffHours} h`
  if (diffDays < 7) return `Hace ${diffDays} d`
  return formatDate(d)
}

/** Generate slug from string */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Truncate text to a given length */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

/** Translate category names to Spanish */
const CATEGORY_TRANSLATIONS: Record<string, string> = {
  dresses: 'Vestidos',
  tops: 'Blusas',
  bottoms: 'Pantalones',
  outerwear: 'Abrigos',
  bags: 'Bolsos',
  shoes: 'Zapatos',
}

export function translateCategory(englishName: string): string {
  const slug = englishName.toLowerCase().replace(/\s+/g, '-')
  return CATEGORY_TRANSLATIONS[slug] || englishName
}

/** Translate size names to Spanish */
const SIZE_TRANSLATIONS: Record<string, string> = {
  'one size': 'Talla Única',
  's': 'S',
  'm': 'M',
  'l': 'L',
  'xl': 'XL',
  'xxl': 'XXL',
}

export function translateSize(size: string): string {
  return SIZE_TRANSLATIONS[size.toLowerCase()] || size
}

/** Normalizes size labels for comparison (trim, collapse spaces, uppercase). */
function normalizeClothingSizeLabel(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ').toUpperCase()
}

/**
 * Standard fashion order: XXS … XS, S, M, L, XL … plus numeric (EU) and one-size last.
 * Unknown labels sort after known ones, alphabetically among themselves.
 */
const CLOTHING_SIZE_ORDER: Record<string, number> = {
  XXXS: 15,
  XXS: 20,
  XS: 30,
  S: 40,
  M: 50,
  L: 60,
  XL: 70,
  XXL: 80,
  '2XL': 80,
  XXXL: 90,
  '3XL': 90,
  XXXXL: 100,
  '4XL': 100,
  OS: 5000,
  TU: 5000,
  U: 5000,
}

function rankClothingSize(normalized: string): number {
  const compact = normalized.replace(/\s/g, '')
  if (CLOTHING_SIZE_ORDER[compact] !== undefined) {
    return CLOTHING_SIZE_ORDER[compact]
  }
  if (/^(ONE|UNICO|UNICA|ÚNICO|ÚNICA)(SIZE)?$/i.test(compact) || compact === 'ONESIZE') {
    return 5000
  }
  if (/^\d+(\.\d+)?$/.test(compact)) {
    return 1000 + parseFloat(compact)
  }
  return 9000
}

export function compareClothingSizes(a: string, b: string): number {
  const na = normalizeClothingSizeLabel(a)
  const nb = normalizeClothingSizeLabel(b)
  const ra = rankClothingSize(na)
  const rb = rankClothingSize(nb)
  if (ra !== rb) return ra - rb
  return na.localeCompare(nb, 'es', { numeric: true, sensitivity: 'base' })
}
