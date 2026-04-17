export const revalidate = 1800 // re-render cada 30 min en Vercel (ISR)

import { createClient } from '@/lib/supabase/server'
import type { Product, Category } from '@/types'
import ProductCatalog from '@/components/store/ProductCatalog'

export const metadata = {
  title: 'Toda la tienda',
  description: 'Explorá la colección completa: vestidos, tops, abrigos, bolsos, zapatos y más.',
}

async function getAllProducts(): Promise<Product[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('products')
    .select('*, images:product_images(*), variants:product_variants(*)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  console.log(
    'Products sample:',
    data?.slice(0, 3).map((p) => ({ id: p.id, name: p.name, category_id: p.category_id }))
  )
  console.log('Total products:', data?.length)

  return (data as Product[]) || []
}

async function getCategories(): Promise<(Category & { product_count: number })[]> {
  const supabase = createClient()

  // 2 queries en lugar de N+1: categorías + IDs de productos activos
  const [{ data: categories }, { data: activeCategoryIds }] = await Promise.all([
    supabase.from('categories').select('*').order('position'),
    supabase.from('products').select('category_id').eq('status', 'active'),
  ])

  if (!categories) return []

  const countMap = (activeCategoryIds ?? []).reduce<Record<string, number>>((acc, { category_id }) => {
    if (category_id) acc[category_id] = (acc[category_id] ?? 0) + 1
    return acc
  }, {})

  return categories.map((cat) => ({ ...cat, product_count: countMap[cat.id] ?? 0 }))
}

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    getAllProducts(),
    getCategories(),
  ])

  return <ProductCatalog initialProducts={products} categories={categories} />
}
