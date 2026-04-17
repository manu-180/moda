import { createClient } from '@/lib/supabase/server'
import type { Product, Category, Collection } from '@/types'
import ProductForm from '@/components/admin/ProductForm'

interface PageProps {
  params: { id: string }
}

async function getData(id: string) {
  const supabase = createClient()

  let product: Product | null = null
  if (id !== 'new') {
    const { data } = await supabase
      .from('products')
      .select('*, images:product_images(*), variants:product_variants(*)')
      .eq('id', id)
      .single()
    product = data as Product
  }

  const { data: categories } = await supabase.from('categories').select('*').order('position')
  const { data: collections } = await supabase.from('collections').select('*').eq('is_active', true)

  return {
    product,
    categories: (categories as Category[]) || [],
    collections: (collections as Collection[]) || [],
  }
}

export default async function EditProductPage({ params }: PageProps) {
  const { product, categories, collections } = await getData(params.id)

  return (
    <ProductForm
      product={product}
      categories={categories}
      collections={collections}
    />
  )
}
