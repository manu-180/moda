export const SITE_NAME = 'MAISON ÉLARA'
export const SITE_DESCRIPTION = 'Moda femenina de lujo — colecciones curadas para la mujer contemporánea.'
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const ORDER_STATUSES = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Confirmado', color: 'bg-blue-100 text-blue-800' },
  shipped: { label: 'Enviado', color: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Entregado', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
} as const

export const PRODUCT_STATUSES = {
  active: { label: 'Activo', color: 'bg-green-100 text-green-800' },
  draft: { label: 'Borrador', color: 'bg-gray-100 text-gray-800' },
  archived: { label: 'Archivado', color: 'bg-red-100 text-red-800' },
} as const

export const NAV_LINKS = [
  { label: 'Novedades', href: '/collections/new-arrivals' },
  { label: 'Colecciones', href: '/collections' },
  { label: 'Ver todo', href: '/products' },
] as const

export const ITEMS_PER_PAGE = 12
