import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { type SiteConfig, SITE_CONFIG_DEFAULTS } from './site-config-types'

function hasSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  )
}

// Parse a JSONB value that may arrive as string or already-parsed object
function parse(v: unknown): unknown {
  if (typeof v === 'string') {
    try {
      return JSON.parse(v)
    } catch {
      return v
    }
  }
  return v
}

function str(raw: Record<string, unknown>, key: string, fallback: string): string {
  const v = raw[key]
  return typeof v === 'string' && v.trim() !== '' ? v : fallback
}

function num(raw: Record<string, unknown>, key: string, fallback: number): number {
  const v = Number(raw[key])
  return Number.isFinite(v) ? v : fallback
}

function bool(raw: Record<string, unknown>, key: string, fallback: boolean): boolean {
  const v = raw[key]
  if (typeof v === 'boolean') return v
  if (v === 'true') return true
  if (v === 'false') return false
  return fallback
}

function mergeSettings(rows: { key: string; value: unknown }[]): SiteConfig {
  // Build flat map of parsed values
  const raw: Record<string, unknown> = {}
  for (const row of rows) {
    raw[row.key] = parse(row.value)
  }

  // JSONB objects merged with defaults
  const features =
    raw.features && typeof raw.features === 'object' && !Array.isArray(raw.features)
      ? { ...SITE_CONFIG_DEFAULTS.features, ...(raw.features as Partial<SiteConfig['features']>) }
      : SITE_CONFIG_DEFAULTS.features

  const announcementRaw =
    raw.announcement_bar && typeof raw.announcement_bar === 'object' && !Array.isArray(raw.announcement_bar)
      ? { ...SITE_CONFIG_DEFAULTS.announcement, ...(raw.announcement_bar as object) }
      : SITE_CONFIG_DEFAULTS.announcement

  const colorsRaw =
    raw.brand_colors && typeof raw.brand_colors === 'object' && !Array.isArray(raw.brand_colors)
      ? { ...SITE_CONFIG_DEFAULTS.colors, ...(raw.brand_colors as object) }
      : SITE_CONFIG_DEFAULTS.colors

  const D = SITE_CONFIG_DEFAULTS

  return {
    identity: {
      store_name: str(raw, 'store_name', D.identity.store_name),
      tagline: str(raw, 'store_tagline', D.identity.tagline),
      description: str(raw, 'store_description', D.identity.description),
      logo_url: (raw.logo_url as string) || null,
      favicon_url: (raw.favicon_url as string) || null,
    },
    contact: {
      phone: str(raw, 'contact_phone', D.contact.phone),
      email: str(raw, 'contact_email', D.contact.email),
      whatsapp: str(raw, 'contact_whatsapp', D.contact.whatsapp),
      hours: str(raw, 'contact_hours', D.contact.hours),
      address: str(raw, 'contact_address', D.contact.address),
    },
    social: {
      instagram: str(raw, 'social_instagram', D.social.instagram),
      pinterest: str(raw, 'social_pinterest', D.social.pinterest),
      twitter: str(raw, 'social_twitter', D.social.twitter),
      facebook: str(raw, 'social_facebook', D.social.facebook),
      tiktok: str(raw, 'social_tiktok', D.social.tiktok),
      instagram_handle: str(raw, 'instagram_handle', D.social.instagram_handle),
    },
    commerce: {
      currency: str(raw, 'store_currency', D.commerce.currency),
      locale: str(raw, 'store_locale', D.commerce.locale),
      free_shipping_threshold: num(raw, 'free_shipping_threshold', D.commerce.free_shipping_threshold),
      shipping_standard: num(raw, 'shipping_standard', D.commerce.shipping_standard),
      tax_rate: num(raw, 'tax_rate', D.commerce.tax_rate),
      footer_copyright_year: num(raw, 'footer_copyright_year', D.commerce.footer_copyright_year),
    },
    hero: {
      title: str(raw, 'hero_title', D.hero.title),
      season_label: str(raw, 'hero_season_label', D.hero.season_label),
      subtitle: str(raw, 'hero_subtitle', D.hero.subtitle),
      cta_text: str(raw, 'hero_cta_text', D.hero.cta_text),
      cta_href: str(raw, 'hero_cta_href', D.hero.cta_href),
      image_url: (raw.hero_image_url as string) || null,
    },
    editorial: {
      season_label: str(raw, 'editorial_season_label', D.editorial.season_label),
      title: str(raw, 'editorial_title', D.editorial.title),
      description: str(raw, 'editorial_description', D.editorial.description),
      cta_href: str(raw, 'editorial_cta_href', D.editorial.cta_href),
    },
    editorial_strip: {
      title: str(raw, 'editorial_strip_title', D.editorial_strip.title),
      subtitle: str(raw, 'editorial_strip_subtitle', D.editorial_strip.subtitle),
    },
    announcement: announcementRaw as SiteConfig['announcement'],
    newsletter: {
      active: bool(raw, 'newsletter_active', D.newsletter.active),
      title: str(raw, 'newsletter_title', D.newsletter.title),
      subtitle: str(raw, 'newsletter_subtitle', D.newsletter.subtitle),
    },
    features,
    colors: colorsRaw as SiteConfig['colors'],
    seo: {
      home_title: str(raw, 'seo_home_title', D.seo.home_title),
      home_description: str(raw, 'seo_home_description', D.seo.home_description),
      og_image: str(raw, 'seo_og_image', D.seo.og_image),
      products_description: str(raw, 'seo_products_description', D.seo.products_description),
      collections_description: str(raw, 'seo_collections_description', D.seo.collections_description),
    },
  }
}

// cache() memoizes within a single request — layout + page + metadata all share one DB call
export const getSiteConfig = cache(async (): Promise<SiteConfig> => {
  if (!hasSupabaseEnv()) return SITE_CONFIG_DEFAULTS

  try {
    const supabase = createClient()
    const { data, error } = await supabase.from('site_settings').select('key, value')

    if (error || !data) return SITE_CONFIG_DEFAULTS
    return mergeSettings(data)
  } catch {
    return SITE_CONFIG_DEFAULTS
  }
})
