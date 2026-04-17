import { createClient } from '@/lib/supabase/server'
import type { Category, Collection } from '@/types'
import AdminCategoriesCollections from '@/components/admin/AdminCategoriesCollections'

async function getData() {
  const supabase = createClient()

  const { data: categories } = await supabase.from('categories').select('*').order('position')
  const { data: collections } = await supabase.from('collections').select('*').order('created_at', { ascending: false })

  // Product counts per category
  const cats = (categories as Category[]) || []
  const withCounts = await Promise.all(
    cats.map(async (cat) => {
      const { count } = await supabase
        .from('products').select('*', { count: 'exact', head: true }).eq('category_id', cat.id)
      return { ...cat, product_count: count || 0 }
    })
  )

  // Product counts per collection
  const cols = (collections as Collection[]) || []
  const colsWithCounts = await Promise.all(
    cols.map(async (col) => {
      const { count } = await supabase
        .from('products').select('*', { count: 'exact', head: true }).eq('collection_id', col.id)
      return { ...col, product_count: count || 0 }
    })
  )

  return { categories: withCounts, collections: colsWithCounts }
}

export default async function AdminCategoriesPage() {
  const { categories, collections } = await getData()
  return <AdminCategoriesCollections initialCategories={categories} initialCollections={collections} />
}
