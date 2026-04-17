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

  return (data as Product[]) || []
}

async function getCategories(): Promise<(Category & { product_count: number })[]> {
  const supabase = createClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('position')

  if (!categories) return []

  const withCounts = await Promise.all(
    categories.map(async (cat) => {
      const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', cat.id)
        .eq('status', 'active')
      return { ...cat, product_count: count || 0 }
    })
  )

  return withCounts
}

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    getAllProducts(),
    getCategories(),
  ])

  return <ProductCatalog initialProducts={products} categories={categories} />
}
