export const revalidate = 86400 // regenerar sitemap cada 24h

import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://maisonelara.com'

  const { data: products } = await supabase
    .from('products').select('slug, updated_at').eq('status', 'active')
  const { data: collections } = await supabase
    .from('collections').select('slug').eq('is_active', true)

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1 },
    { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${baseUrl}/collections`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.85 },
    { url: `${baseUrl}/collections/new-arrivals`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.82 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.65 },
    { url: `${baseUrl}/atelier`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.65 },
    { url: `${baseUrl}/sustainability`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.65 },
    { url: `${baseUrl}/press`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.55 },
    { url: `${baseUrl}/shipping-returns`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.55 },
    { url: `${baseUrl}/size-guide`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.55 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.55 },
  ]

  const productPages = (products || []).map((p) => ({
    url: `${baseUrl}/products/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const collectionPages = (collections || []).map((c) => ({
    url: `${baseUrl}/collections/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...productPages, ...collectionPages]
}
