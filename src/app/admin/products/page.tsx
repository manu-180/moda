import { createClient } from '@/lib/supabase/server'
import type { Product, Category } from '@/types'
import AdminProductsList from '@/components/admin/AdminProductsList'

async function getData() {
  const supabase = createClient()

  const { data: products } = await supabase
    .from('products')
    .select('*, images:product_images(*), variants:product_variants(*)')
    .order('created_at', { ascending: false })

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('position')

  return {
    products: (products as Product[]) || [],
    categories: (categories as Category[]) || [],
  }
}

export default async function AdminProductsPage() {
  const { products, categories } = await getData()
  return <AdminProductsList initialProducts={products} categories={categories} />
}
