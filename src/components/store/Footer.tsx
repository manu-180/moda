'use client'

import Image from 'next/image'
import { Instagram } from 'lucide-react'
import { useSiteConfig } from '@/lib/site-config-context'

const CUSTOMER_CARE = [
  'Contacto',
  'Envíos y devoluciones',
  'Guía de talles',
  'Preguntas frecuentes',
]

const ABOUT = ['Nuestra historia', 'Atelier', 'Sostenibilidad', 'Prensa']

function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.236 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.182-.78 1.172-4.97 1.172-4.97s-.299-.598-.299-1.482c0-1.388.806-2.425 1.808-2.425.853 0 1.265.64 1.265 1.408 0 .858-.546 2.14-.828 3.33-.236.995.499 1.806 1.48 1.806 1.778 0 3.144-1.874 3.144-4.58 0-2.393-1.72-4.068-4.177-4.068-2.845 0-4.515 2.135-4.515 4.34 0 .859.331 1.781.745 2.282a.3.3 0 01.069.288l-.278 1.133c-.044.183-.145.222-.335.134-1.249-.581-2.03-2.407-2.03-3.874 0-3.154 2.292-6.052 6.608-6.052 3.469 0 6.165 2.473 6.165 5.776 0 3.447-2.173 6.22-5.19 6.22-1.013 0-1.965-.527-2.291-1.148l-.623 2.378c-.226.869-.835 1.958-1.244 2.621.937.29 1.931.446 2.962.446 5.523 0 10-4.477 10-10S17.523 2 12 2z" />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  )
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.21 8.21 0 004.79 1.52V6.76a4.85 4.85 0 01-1.02-.07z" />
    </svg>
  )
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
    </svg>
  )
}

export default function Footer() {
  const { identity, contact, social, commerce } = useSiteConfig()

  return (
    <footer className="bg-cream" style={{ borderTop: '1px solid rgba(196,162,101,0.25)' }}>
      <div className="max-w-[1600px] mx-auto px-6 md:px-16 pt-20 pb-10">
        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-8 text-center md:text-left">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start">
            <div className="font-display text-[20px] tracking-[0.08em] text-charcoal">
              {identity.logo_url ? (
                <Image src={identity.logo_url} alt={identity.store_name} width={160} height={32} className="h-8 w-auto object-contain" />
              ) : (
                identity.store_name
              )}
            </div>
            {identity.tagline && (
              <p className="font-body text-[13px] italic text-warm-gray mt-3 max-w-[220px]">
                {identity.tagline}
              </p>
            )}
            {contact.address && (
              <p className="font-body text-[12px] text-warm-gray mt-2 max-w-[220px]">
                {contact.address}
              </p>
            )}

            {/* Social icons */}
            <div className="flex items-center gap-5 mt-6">
              {social.instagram && (
                <span aria-hidden className="text-warm-gray hover:text-charcoal transition-colors duration-200 inline-flex">
                  <Instagram className="h-[18px] w-[18px]" strokeWidth={1.5} />
                </span>
              )}
              {social.pinterest && (
                <span aria-hidden className="text-warm-gray hover:text-charcoal transition-colors duration-200 inline-flex">
                  <PinterestIcon className="h-[18px] w-[18px]" />
                </span>
              )}
              {social.twitter && (
                <span aria-hidden className="text-warm-gray hover:text-charcoal transition-colors duration-200 inline-flex">
                  <XIcon className="h-[18px] w-[18px]" />
                </span>
              )}
              {social.facebook && (
                <span aria-hidden className="text-warm-gray hover:text-charcoal transition-colors duration-200 inline-flex">
                  <FacebookIcon className="h-[18px] w-[18px]" />
                </span>
              )}
              {social.tiktok && (
                <span aria-hidden className="text-warm-gray hover:text-charcoal transition-colors duration-200 inline-flex p-1 -m-1">
                  <TikTokIcon className="h-[18px] w-[18px]" />
                </span>
              )}
              {contact.whatsapp && (
                <span aria-hidden className="text-warm-gray hover:text-charcoal transition-colors duration-200 inline-flex p-1 -m-1">
                  <WhatsAppIcon className="h-[18px] w-[18px]" />
                </span>
              )}
            </div>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="font-body text-[11px] uppercase tracking-[0.15em] text-warm-gray mb-6">
              Atención al cliente
            </h3>
            <ul className="flex flex-col gap-2">
              {CUSTOMER_CARE.map((label) => (
                <li key={label}>
                  <span className="group font-body text-[13px] text-dark-gray hover:text-charcoal transition-colors duration-200 inline-block py-1.5 -my-0.5 px-1 -mx-1 rounded-sm">
                    <span className="relative">
                      {label}
                      <span className="absolute -bottom-0.5 left-0 h-[1px] w-0 bg-charcoal transition-all duration-300 group-hover:w-full" />
                    </span>
                  </span>
                </li>
              ))}
              {contact.email && (
                <li>
                  <span className="group font-body text-[13px] text-dark-gray hover:text-charcoal transition-colors duration-200 inline-block py-1.5 -my-0.5 px-1 -mx-1 rounded-sm">
                    <span className="relative">
                      {contact.email}
                      <span className="absolute -bottom-0.5 left-0 h-[1px] w-0 bg-charcoal transition-all duration-300 group-hover:w-full" />
                    </span>
                  </span>
                </li>
              )}
              {contact.phone && (
                <li>
                  <span className="group font-body text-[13px] text-dark-gray hover:text-charcoal transition-colors duration-200 inline-block py-1.5 -my-0.5 px-1 -mx-1 rounded-sm">
                    <span className="relative">
                      {contact.phone}
                      <span className="absolute -bottom-0.5 left-0 h-[1px] w-0 bg-charcoal transition-all duration-300 group-hover:w-full" />
                    </span>
                  </span>
                </li>
              )}
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="font-body text-[11px] uppercase tracking-[0.15em] text-warm-gray mb-6">
              Nosotros
            </h3>
            <ul className="flex flex-col gap-2">
              {ABOUT.map((label) => (
                <li key={label}>
                  <span className="group font-body text-[13px] text-dark-gray hover:text-charcoal transition-colors duration-200 inline-block py-1.5 -my-0.5 px-1 -mx-1 rounded-sm">
                    <span className="relative">
                      {label}
                      <span className="absolute -bottom-0.5 left-0 h-[1px] w-0 bg-charcoal transition-all duration-300 group-hover:w-full" />
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-6 border-t border-pale-gray flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-body text-[11px] text-warm-gray">
            © {commerce.footer_copyright_year} {identity.store_name}. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4 sm:gap-6">
            <span className="font-body text-[11px] text-warm-gray hover:text-charcoal transition-colors duration-200 inline-block py-1.5 px-1 -mx-1 -my-1 rounded-sm">
              Política de privacidad
            </span>
            <span className="font-body text-[11px] text-warm-gray hover:text-charcoal transition-colors duration-200 inline-block py-1.5 px-1 -mx-1 -my-1 rounded-sm">
              Términos
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
