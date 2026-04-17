import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import type { Product, Collection } from '@/types'
import { SITE_NAME } from '@/lib/constants'
import { editorialImages } from '@/lib/editorial-images'
import CollectionPageContent from '@/components/store/CollectionPage'

/** Ruta fija del menú; no requiere fila en `collections` (usa `products.is_new`). */
const NEW_ARRIVALS_SLUG = 'new-arrivals'

const VIRTUAL_NEW_ARRIVALS: Collection = {
  id: 'a0000000-0000-4000-8000-000000000001',
  name: 'Novedades',
  slug: NEW_ARRIVALS_SLUG,
  description:
    'Piezas recién incorporadas: lo último en siluetas, tejidos y detalles para esta temporada.',
  image_url: editorialImages.collectionNew,
  is_active: true,
}

interface PageProps { params: { slug: string } }

async function getData(slug: string) {
  const supabase = createClient()

  if (slug === NEW_ARRIVALS_SLUG) {
    const { data: products } = await supabase
      .from('products')
      .select('*, images:product_images(*), variants:product_variants(*)')
      .eq('status', 'active')
      .eq('is_new', true)
      .order('created_at', { ascending: false })

    return { collection: VIRTUAL_NEW_ARRIVALS, products: (products as Product[]) || [] }
  }

  const { data: collection } = await supabase
    .from('collections')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!collection) return null

  const { data: products } = await supabase
    .from('products')
    .select('*, images:product_images(*), variants:product_variants(*)')
    .eq('collection_id', collection.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  return { collection: collection as Collection, products: (products as Product[]) || [] }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const result = await getData(params.slug)
  if (!result) return { title: 'Colección no encontrada' }
  return {
    title: `${result.collection.name} | ${SITE_NAME}`,
    description: result.collection.description?.slice(0, 160),
  }
}

export default async function CollectionPage({ params }: PageProps) {
  const result = await getData(params.slug)
  if (!result) notFound()
  return <CollectionPageContent collection={result.collection} products={result.products} />
}
