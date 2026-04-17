import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import type { Collection } from '@/types'
import { SITE_NAME } from '@/lib/constants'
import CollectionsIndex from '@/components/store/CollectionsIndex'

export const metadata: Metadata = {
  title: `Colecciones | ${SITE_NAME}`,
  description: 'Explorá nuestras colecciones curadas: temporadas, campañas y líneas exclusivas.',
}

async function getCollectionsWithCounts() {
  const supabase = createClient()
  const { data: collections } = await supabase
    .from('collections')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (!collections?.length) return []

  const withCounts = await Promise.all(
    (collections as Collection[]).map(async (col) => {
      const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('collection_id', col.id)
        .eq('status', 'active')
      return { ...col, product_count: count || 0 }
    })
  )

  return withCounts
}

export default async function CollectionsPage() {
  const collections = await getCollectionsWithCounts()
  return <CollectionsIndex collections={collections} />
}
