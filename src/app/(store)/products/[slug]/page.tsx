import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import type { Product, Category } from '@/types'
import ProductGallery from '@/components/store/ProductGallery'
import ProductInfo from '@/components/store/ProductInfo'
import RelatedProducts from '@/components/store/RelatedProducts'
import { SITE_NAME } from '@/lib/constants'
import { getGalleryImagesForProduct } from '@/lib/editorial-images'

interface PageProps {
  params: { slug: string }
}

async function getProduct(slug: string): Promise<{ product: Product; category: Category | null } | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('products')
    .select('*, images:product_images(*), variants:product_variants(*)')
    .eq('slug', slug)
    .eq('status', 'active')
    .eq('variants.is_active', true)
    .single()

  if (!data) return null

  let category: Category | null = null
  if (data.category_id) {
    const { data: cat } = await supabase
      .from('categories')
      .select('*')
      .eq('id', data.category_id)
      .single()
    category = cat
  }

  return { product: data as Product, category }
}

async function getRelatedProducts(product: Product): Promise<Product[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('products')
    .select('*, images:product_images(*), variants:product_variants(*)')
    .eq('status', 'active')
    .eq('category_id', product.category_id)
    .neq('id', product.id)
    .limit(6)

  return (data as Product[]) || []
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const result = await getProduct(params.slug)
  if (!result) return { title: 'Producto no encontrado' }

  const ogImages = getGalleryImagesForProduct(result.product)
  return {
    title: `${result.product.name} | ${SITE_NAME}`,
    description: result.product.description?.slice(0, 160),
    openGraph: {
      title: result.product.name,
      description: result.product.description?.slice(0, 160),
      images: ogImages[0]?.url ? [ogImages[0].url] : [],
    },
  }
}

export default async function ProductPage({ params }: PageProps) {
  const result = await getProduct(params.slug)
  if (!result) notFound()

  const { product, category } = result
  const related = await getRelatedProducts(product)

  return (
    <div className="max-w-[1600px] mx-auto px-6 md:px-16 lg:px-20 py-8 md:py-12">
      {/* Main: Gallery + Info */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Gallery — 60% */}
        <div className="w-full lg:w-[60%]">
          <ProductGallery images={getGalleryImagesForProduct(product)} />
        </div>

        {/* Info — 40% */}
        <div className="w-full lg:w-[40%]">
          <ProductInfo product={product} category={category} />
        </div>
      </div>

      {/* Mobile sticky add-to-bag bar is handled inside ProductInfo via CSS */}

      {/* Related products */}
      {related.length > 0 && (
        <>
          <RelatedProducts title="Completa el look" products={related.slice(0, 4)} />
          {related.length > 4 && (
            <RelatedProducts title="También te puede interesar" products={related.slice(4)} />
          )}
        </>
      )}
    </div>
  )
}
