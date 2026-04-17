import type { Product, ProductImage } from '@/types'

/** Unsplash CDN — todos los IDs verificados con respuesta 200 */
const u = (photoId: string, w: number) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=${w}&q=85`

/**
 * Devuelve true solo si la URL es remota (https://...).
 * Las rutas locales como /images/products/placeholder-*.jpg se tratan como ausentes.
 */
export function isRemoteImageUrl(url: string | undefined | null): boolean {
  const t = url?.trim()
  if (!t) return false
  return t.startsWith('https://') || t.startsWith('http://')
}

const isRemote = (url: string) => isRemoteImageUrl(url)

/**
 * Imágenes de marketing — moda femenina editorial, verificadas como 200 OK
 *
 * hero        → mujer en crop top amarillo, look urbano dinámico
 * autumn      → street style en Milán, look azul frente al Duomo
 * megaMenu    → mujer con sombrero, vibes Los Ángeles / lifestyle fashion
 * newsletter  → modelo asiática en top con volados, muy editorial
 * collections → fotos de moda femenina para hero de colecciones
 */
export const editorialImages = {
  hero: u('photo-1515886657613-9f3515b0c78f', 2400),
  editorialAutumn: u('photo-1539109136881-3be0616acf4b', 1600),
  megaMenu: u('photo-1617922001439-4a2e6562f328', 1200),
  newsletter: u('photo-1581044777550-4cfa60707c03', 2000),
  collectionDefault: u('photo-1490481651871-ab68de25d43d', 2000),
  collectionAutumn: u('photo-1524504388940-b1c1722653e1', 2000),
  collectionNew: u('photo-1572804013309-59a88b7e92f1', 2000),
}

/** Grid tipo Instagram — 6 imágenes de moda verificadas */
export const instagramGridImages: { src: string; alt: string }[] = [
  {
    src: u('photo-1515886657613-9f3515b0c78f', 800),
    alt: 'Crop top amarillo — look urbano contemporáneo',
  },
  {
    src: u('photo-1543163521-1bf539c55dd2', 800),
    alt: 'Tacones con estampado floral — calzado de lujo',
  },
  {
    src: u('photo-1590874103328-eac38a683ce7', 800),
    alt: 'Bolso de piel naranja — accesorio premium',
  },
  {
    src: u('photo-1469334031218-e382a71b716b', 800),
    alt: 'Vestido verde y gafas — street style verano',
  },
  {
    src: u('photo-1539109136881-3be0616acf4b', 800),
    alt: 'Street style Milán — abrigo azul frente al Duomo',
  },
  {
    src: u('photo-1496747611176-843222e1e57c', 800),
    alt: 'Vestido floral — look de playa sofisticado',
  },
]

/** Fallback por categoría — todas verificadas 200 OK */
const categoryBySlug: Record<string, string> = {
  // vestido rojo fluido — perfecta para categoría vestidos
  dresses: u('photo-1595777457583-95e059d581b8', 1200),
  // look cream/blanco — tops y blusas
  tops: u('photo-1619086303291-0ef7699e4b31', 1200),
  // jeans con parches — bottoms y pantalones
  bottoms: u('photo-1541099649105-f69ad21f3246', 1200),
  // abrigo camel — outerwear de temporada
  outerwear: u('photo-1539533018447-63fcce2678e3', 1200),
  // bolso naranja premium — accesorios
  bags: u('photo-1590874103328-eac38a683ce7', 1200),
  // tacones florales azules — calzado de diseño
  shoes: u('photo-1543163521-1bf539c55dd2', 1200),
}

const COLLECTION_BY_SLUG: Record<string, string> = {
  'autumn-whisper': editorialImages.collectionAutumn,
  'new-arrivals': editorialImages.collectionNew,
}

/**
 * Pool de 12 fotos de moda femenina — 100% verificadas, cero hombres, cero paisajes
 * Variedad: vestidos, accesorios, street style, editorial, lifestyle
 */
const PRODUCT_POOL = [
  u('photo-1595777457583-95e059d581b8', 1200), // vestido rojo fluido
  u('photo-1594633312681-425c7b97ccd1', 1200), // editorial elegante
  u('photo-1515886657613-9f3515b0c78f', 1200), // crop top amarillo
  u('photo-1469334031218-e382a71b716b', 1200), // vestido verde teal
  u('photo-1572804013309-59a88b7e92f1', 1200), // wrap dress floral rojo
  u('photo-1526413232644-8a40f03cc03b', 1200), // camisa blanca editorial
  u('photo-1617922001439-4a2e6562f328', 1200), // lifestyle LA sombrero
  u('photo-1581044777550-4cfa60707c03', 1200), // top con volados editorial
  u('photo-1619086303291-0ef7699e4b31', 1200), // outfit crema sofisticado
  u('photo-1539109136881-3be0616acf4b', 1200), // street style Milán
  u('photo-1496747611176-843222e1e57c', 1200), // vestido floral playa
  u('photo-1502716119720-b23a93e5fe1b', 1200), // look vichy desierto
]

function hashSlug(slug: string): number {
  let h = 0
  for (let i = 0; i < slug.length; i++) h = (Math.imul(31, h) + slug.charCodeAt(i)) | 0
  return Math.abs(h)
}

export function productFallbackUrl(slug: string, index: 0 | 1): string {
  const h = hashSlug(slug)
  const i = (h + index) % PRODUCT_POOL.length
  const j = (h + index + 7) % PRODUCT_POOL.length
  return index === 0 ? PRODUCT_POOL[i] : PRODUCT_POOL[j]
}

export function categoryImageUrl(slug: string, dbUrl?: string | null): string {
  const t = dbUrl?.trim()
  if (t && isRemote(t)) return t
  return categoryBySlug[slug] ?? u('photo-1595777457583-95e059d581b8', 1200)
}

export function collectionHeroUrl(slug: string, dbUrl?: string | null): string {
  const t = dbUrl?.trim()
  if (t && isRemote(t)) return t
  return COLLECTION_BY_SLUG[slug] ?? editorialImages.collectionDefault
}

export function getPrimaryProductImageUrl(product: {
  slug: string
  images?: Array<{ url: string } | null>
}): string {
  const first = product.images?.[0]?.url?.trim()
  if (first && isRemote(first)) return first
  return productFallbackUrl(product.slug, 0)
}

export function getGalleryImagesForProduct(product: Product): ProductImage[] {
  const sorted = [...(product.images || [])]
    .sort((a, b) => a.position - b.position)
    .filter((img) => isRemote(img.url))
  if (sorted.length > 0) return sorted
  return [
    {
      id: `ph-${product.slug}-a`,
      product_id: product.id,
      url: productFallbackUrl(product.slug, 0),
      alt: product.name,
      position: 0,
    },
    {
      id: `ph-${product.slug}-b`,
      product_id: product.id,
      url: productFallbackUrl(product.slug, 1),
      alt: product.name,
      position: 1,
    },
  ]
}
