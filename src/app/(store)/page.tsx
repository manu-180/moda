export const revalidate = 3600 // re-render cada 1 hora en Vercel (ISR)

import { createClient } from '@/lib/supabase/server'
import { getSiteConfig } from '@/lib/site-config'
import type { Product, Category } from '@/types'
import HeroSection from '@/components/store/HeroSection'
import EditorialStrip from '@/components/store/EditorialStrip'
import NewArrivals from '@/components/store/NewArrivals'
import EditorialSection from '@/components/store/EditorialSection'
import CategoriesGrid from '@/components/store/CategoriesGrid'
import PressStrip from '@/components/store/PressStrip'
import InstagramFeed from '@/components/store/InstagramFeed'
import NewsletterCTA from '@/components/store/NewsletterCTA'

function hasSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  )
}

async function getNewArrivals(): Promise<Product[]> {
  if (!hasSupabaseEnv()) return []
  const supabase = createClient()
  const { data } = await supabase
    .from('products')
    .select('*, images:product_images(*), variants:product_variants(*)')
    .eq('is_new', true)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(8)
  return (data as Product[]) || []
}

async function getCategories(): Promise<(Category & { product_count: number })[]> {
  if (!hasSupabaseEnv()) return []
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

export default async function HomePage() {
  const [config, newArrivals, categories] = await Promise.all([
    getSiteConfig(),
    getNewArrivals(),
    getCategories(),
  ])

  const { features } = config

  return (
    <>
      <HeroSection />
      {features.show_editorial_strip && <EditorialStrip />}
      <NewArrivals products={newArrivals} />
      {features.show_editorial_section && <EditorialSection />}
      <CategoriesGrid categories={categories} />
      {features.show_press_strip && <PressStrip />}
      {features.show_instagram_feed && <InstagramFeed />}
      {features.show_newsletter_cta && <NewsletterCTA />}
    </>
  )
}
