// ─── SiteConfig ────────────────────────────────────────────────────────────
// Single source of truth for all per-client configuration.
// Extend this type when adding new settings (then update mergeSettings in site-config.ts).

export interface SiteConfig {
  identity: {
    store_name: string
    tagline: string
    description: string
    logo_url: string | null
    favicon_url: string | null
  }
  contact: {
    phone: string
    email: string
    whatsapp: string
    hours: string
    address: string
  }
  social: {
    instagram: string
    pinterest: string
    twitter: string
    facebook: string
    tiktok: string
    instagram_handle: string
  }
  commerce: {
    currency: string
    locale: string
    free_shipping_threshold: number
    shipping_standard: number
    tax_rate: number
    footer_copyright_year: number
  }
  hero: {
    title: string
    season_label: string
    subtitle: string
    cta_text: string
    cta_href: string
    image_url: string | null
  }
  editorial: {
    season_label: string
    title: string
    description: string
    cta_href: string
  }
  editorial_strip: {
    title: string
    subtitle: string
  }
  announcement: {
    text: string
    active: boolean
    link: string
  }
  newsletter: {
    active: boolean
    title: string
    subtitle: string
  }
  features: {
    show_instagram_feed: boolean
    show_press_strip: boolean
    show_newsletter_cta: boolean
    show_editorial_section: boolean
    show_announcement_bar: boolean
    show_editorial_strip: boolean
  }
  colors: {
    primary: string
    accent: string
  }
  seo: {
    home_title: string
    home_description: string
    og_image: string
    products_description: string
    collections_description: string
  }
}

// ─── Defaults ──────────────────────────────────────────────────────────────
// Used as fallback when Supabase is unreachable or a key is missing.
// These values represent the MAISON ÉLARA demo identity.

export const SITE_CONFIG_DEFAULTS: SiteConfig = {
  identity: {
    store_name: 'MAISON ÉLARA',
    tagline: 'Lujo contemporáneo desde Buenos Aires',
    description: 'Moda femenina de lujo — colecciones curadas para la mujer contemporánea.',
    logo_url: null,
    favicon_url: null,
  },
  contact: {
    phone: '',
    email: '',
    whatsapp: 'https://wa.me/5491124842720',
    hours: '',
    address: '',
  },
  social: {
    instagram: 'https://instagram.com/maisonelara',
    pinterest: 'https://pinterest.com',
    twitter: 'https://x.com',
    facebook: '',
    tiktok: '',
    instagram_handle: '@maisonelara',
  },
  commerce: {
    currency: 'USD',
    locale: 'es-AR',
    free_shipping_threshold: 500,
    shipping_standard: 15,
    tax_rate: 0.1,
    footer_copyright_year: new Date().getFullYear(),
  },
  hero: {
    title: 'El arte del lujo silencioso.',
    season_label: 'Colección 2026',
    subtitle: 'Piezas atemporales. Craftsmanship sin concesiones.',
    cta_text: 'Descubrir la colección',
    cta_href: '/collections/autumn-whisper',
    image_url: null,
  },
  editorial: {
    season_label: 'FW25 Collection',
    title: 'Autumn Whisper',
    description:
      'Una colección inspirada en la quietud de los amaneceres de otoño. Siluetas suaves, texturas profundas y una paleta tomada de las hojas caídas y los horizontes brumosos.',
    cta_href: '/collections/autumn-whisper',
  },
  editorial_strip: {
    title: 'Donde la artesanía encuentra la visión contemporánea',
    subtitle:
      'Cada pieza es un homenaje al arte de vestir — diseñada en Buenos Aires, pensada para el mundo.',
  },
  announcement: {
    text: 'Envío gratuito en compras superiores a $500',
    active: true,
    link: '',
  },
  newsletter: {
    active: true,
    title: 'Recibí nuestras cartas.',
    subtitle: 'Acceso anticipado a colecciones. Eventos privados. Historias de la casa.',
  },
  features: {
    show_instagram_feed: true,
    show_press_strip: true,
    show_newsletter_cta: true,
    show_editorial_section: true,
    show_announcement_bar: true,
    show_editorial_strip: true,
  },
  colors: {
    primary: '#C4A265',
    accent: '#A47764',
  },
  seo: {
    home_title: 'MAISON ÉLARA | Moda de lujo contemporánea',
    home_description:
      'Piezas atemporales pensadas para la mujer actual. Moda de lujo diseñada en Buenos Aires.',
    og_image: '',
    products_description: 'Explorá nuestro catálogo de moda de lujo femenina.',
    collections_description: 'Colecciones curadas de moda contemporánea.',
  },
}
