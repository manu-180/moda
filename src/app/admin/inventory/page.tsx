import { createClient } from '@/lib/supabase/server'
import type { Product, Category } from '@/types'
import AdminInventory from '@/components/admin/AdminInventory'

async function getData() {
  const supabase = createClient()
  const { data: products } = await supabase
    .from('products')
    .select('*, images:product_images(*), variants:product_variants(*)')
    .eq('status', 'active')
    .order('name')

  const { data: categories } = await supabase.from('categories').select('*').order('position')

  return {
    products: (products as Product[]) || [],
    categories: (categories as Category[]) || [],
  }
}

export default async function InventoryPage() {
  const { products, categories } = await getData()
  return <AdminInventory products={products} categories={categories} />
}
