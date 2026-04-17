import type { Metadata } from 'next'
import { Inter, Bodoni_Moda } from 'next/font/google'
import { ToastProvider } from '@/components/ui/Toast'
import { getSiteConfig } from '@/lib/site-config'
import { SiteConfigProvider } from '@/lib/site-config-context'
import '@/styles/globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
})

const bodoni = Bodoni_Moda({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-bodoni',
  display: 'swap',
  adjustFontFallback: false,
})

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig()
  const { store_name, description } = config.identity
  const { home_title, og_image } = config.seo
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return {
    title: {
      default: home_title || store_name,
      template: `%s | ${store_name}`,
    },
    description,
    metadataBase: new URL(siteUrl),
    openGraph: {
      title: store_name,
      description,
      type: 'website',
      locale: 'es_AR',
      siteName: store_name,
      ...(og_image ? { images: [{ url: og_image }] } : {}),
    },
    robots: { index: true, follow: true },
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const config = await getSiteConfig()

  // Inject client brand colors as CSS vars — overrides the defaults in globals.css.
  // champagne and mocha in tailwind.config.ts reference var(--color-brand-primary/accent).
  const brandCSS = `:root{--color-brand-primary:${config.colors.primary};--color-brand-accent:${config.colors.accent};}`

  return (
    <html lang="es" className={`${inter.variable} ${bodoni.variable}`}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: brandCSS }} />
        {config.identity.favicon_url && (
          <link rel="icon" href={config.identity.favicon_url} />
        )}
      </head>
      <body className="font-body text-charcoal bg-cream antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:bg-charcoal focus:text-white focus:px-4 focus:py-2 focus:font-body focus:text-[12px]"
        >
          Ir al contenido
        </a>
        <SiteConfigProvider config={config}>
          <ToastProvider>
            <div id="main-content">{children}</div>
          </ToastProvider>
        </SiteConfigProvider>
      </body>
    </html>
  )
}
