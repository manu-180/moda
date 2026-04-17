'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Search, Heart, ShoppingBag, User, Menu, X } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import CartDrawer from './CartDrawer'
import SearchOverlay from './SearchOverlay'
import { cn } from '@/lib/utils'
import { editorialImages } from '@/lib/editorial-images'
import { useSiteConfig } from '@/lib/site-config-context'

const NAV_LINKS = [
  { label: 'NOVEDADES', href: '/collections/new-arrivals' },
  { label: 'COLECCIONES', href: '/collections' },
  { label: 'TIENDA', href: '/products' },
] as const

const CATEGORIES = [
  { label: 'Vestidos', href: '/products?category=dresses' },
  { label: 'Tops', href: '/products?category=tops' },
  { label: 'Pantalones', href: '/products?category=bottoms' },
  { label: 'Abrigos', href: '/products?category=outerwear' },
  { label: 'Bolsos', href: '/products?category=bags' },
  { label: 'Zapatos', href: '/products?category=shoes' },
]

function isNavActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function Navbar() {
  const { identity, announcement, features, editorial } = useSiteConfig()
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const megaTimeout = useRef<NodeJS.Timeout | null>(null)
  const itemCount = useCartStore((s) => s.getItemCount())

  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  function handleMegaEnter() {
    if (megaTimeout.current) clearTimeout(megaTimeout.current)
    setMegaOpen(true)
  }

  function handleMegaLeave() {
    megaTimeout.current = setTimeout(() => setMegaOpen(false), 200)
  }

  const atopDarkHero = pathname === '/' && !scrolled

  const iconBtn = (extra: string) =>
    cn(
      'transition-colors duration-200 min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-sm touch-manipulation',
      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
      atopDarkHero
        ? 'text-white/90 hover:text-white focus-visible:outline-white/80'
        : 'text-charcoal hover:text-warm-gray focus-visible:outline-charcoal/30'
    )

  const showAnnouncement = features.show_announcement_bar && announcement.active && announcement.text

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-[400ms] ease-luxury',
          atopDarkHero
            ? 'border-b border-white/[0.14] bg-black/25 shadow-[0_1px_0_rgba(255,255,255,0.06)_inset] backdrop-blur-md supports-[backdrop-filter]:bg-black/15'
            : 'border-b border-pale-gray/90 bg-white/[0.96] shadow-[0_1px_0_rgba(0,0,0,0.06),0_8px_24px_-12px_rgba(0,0,0,0.08)] backdrop-blur-[20px]'
        )}
      >
        {/* Announcement bar */}
        {showAnnouncement && (
          <div
            className={cn(
              'flex min-h-7 md:min-h-8 items-center justify-center border-b px-3 py-1.5 sm:px-4 sm:py-0',
              atopDarkHero ? 'border-white/[0.12] bg-black/20' : 'border-pale-gray/80 bg-black/[0.02]'
            )}
          >
            {announcement.link ? (
              <Link
                href={announcement.link}
                className={cn(
                  'font-body max-w-[min(100%,42rem)] text-[9px] md:text-[10px] uppercase tracking-[0.18em] sm:tracking-[0.2em] md:tracking-[0.24em] text-center leading-snug text-balance hover:opacity-70 transition-opacity',
                  atopDarkHero ? 'text-white/70' : 'text-warm-gray'
                )}
              >
                {announcement.text}
              </Link>
            ) : (
              <p
                className={cn(
                  'font-body max-w-[min(100%,42rem)] text-[9px] md:text-[10px] uppercase tracking-[0.18em] sm:tracking-[0.2em] md:tracking-[0.24em] text-center leading-snug text-balance',
                  atopDarkHero ? 'text-white/70' : 'text-warm-gray'
                )}
              >
                {announcement.text}
              </p>
            )}
          </div>
        )}

        {/* Desktop nav */}
        <nav
          aria-label="Principal"
          className="relative hidden md:grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center md:h-[72px] md:px-10 lg:px-16 md:max-w-[1600px] md:mx-auto"
        >
          <div className="flex items-center gap-8 justify-self-start min-w-0">
            {NAV_LINKS.map((link) => {
              const active = isNavActive(pathname, link.href)
              return (
                <div
                  key={link.label}
                  onMouseEnter={link.label === 'TIENDA' ? handleMegaEnter : undefined}
                  onMouseLeave={link.label === 'TIENDA' ? handleMegaLeave : undefined}
                >
                  <Link
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'group relative font-body text-[12px] uppercase tracking-[0.12em] py-2 transition-colors duration-300',
                      atopDarkHero ? 'text-white/95 hover:text-white' : 'text-charcoal hover:text-charcoal',
                      active && (atopDarkHero ? 'text-white' : 'text-charcoal')
                    )}
                  >
                    {link.label}
                    <span
                      className={cn(
                        'absolute bottom-0 left-1/2 -translate-x-1/2 h-px transition-all duration-300 ease-luxury',
                        active ? 'w-full' : 'w-0 group-hover:w-full',
                        atopDarkHero ? 'bg-white' : 'bg-charcoal'
                      )}
                    />
                  </Link>
                </div>
              )
            })}
          </div>

          {/* Logo / store name */}
          <Link
            href="/"
            className={cn(
              'justify-self-center font-display text-[22px] lg:text-[24px] tracking-[0.14em] whitespace-nowrap transition-colors duration-300 px-2',
              atopDarkHero ? 'text-white' : 'text-charcoal'
            )}
          >
            {identity.logo_url ? (
              <img src={identity.logo_url} alt={identity.store_name} className="h-8 w-auto object-contain" />
            ) : (
              identity.store_name
            )}
          </Link>

          <div className="flex items-center gap-2 justify-self-end min-w-0">
            <button type="button" aria-label="Buscar" className={iconBtn('')} onClick={() => setSearchOpen(true)}>
              <Search className="h-[22px] w-[22px]" strokeWidth={1.25} />
            </button>
            <span className={cn('hidden lg:block h-4 w-px shrink-0', atopDarkHero ? 'bg-white/25' : 'bg-pale-gray')} aria-hidden />
            <button type="button" aria-label="Favoritos" className={iconBtn('')}>
              <Heart className="h-[22px] w-[22px]" strokeWidth={1.25} />
            </button>
            <button type="button" aria-label="Bolsa de compras" className={cn(iconBtn(''), 'relative')} onClick={() => setCartOpen(true)}>
              <ShoppingBag className="h-[22px] w-[22px]" strokeWidth={1.25} />
              {mounted && itemCount > 0 && (
                <span
                  className={cn(
                    'absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] px-0.5 items-center justify-center text-[9px] font-body font-medium rounded-full tabular-nums',
                    atopDarkHero ? 'bg-white text-charcoal border border-white/40' : 'bg-charcoal text-white'
                  )}
                >
                  {itemCount}
                </span>
              )}
            </button>
            <Link href="/auth/login" aria-label="Cuenta" className={iconBtn('')}>
              <User className="h-[22px] w-[22px]" strokeWidth={1.25} />
            </Link>
          </div>
        </nav>

        {/* Mega Menu */}
        <AnimatePresence>
          {megaOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              onMouseEnter={handleMegaEnter}
              onMouseLeave={handleMegaLeave}
              className="absolute top-full left-0 right-0 hidden md:block bg-white border-b border-pale-gray/90 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.08)]"
            >
              <div className="max-w-[1600px] mx-auto px-10 lg:px-16 py-10 grid grid-cols-4 gap-10">
                {[CATEGORIES.slice(0, 3), CATEGORIES.slice(3, 6)].map((group, i) => (
                  <div key={i} className="flex flex-col gap-3">
                    {group.map((cat) => (
                      <Link
                        key={cat.label}
                        href={cat.href}
                        onClick={() => setMegaOpen(false)}
                        className="font-body text-[13px] text-charcoal hover:text-warm-gray transition-colors duration-200 group relative"
                      >
                        <span className="relative inline-block">
                          {cat.label}
                          <span className="absolute -bottom-0.5 left-0 h-[1px] w-0 bg-champagne transition-all duration-300 group-hover:w-full" />
                        </span>
                      </Link>
                    ))}
                    <Link
                      href="/products"
                      onClick={() => setMegaOpen(false)}
                      className="mt-2 font-body text-[11px] uppercase tracking-[0.1em] text-warm-gray hover:text-charcoal transition-colors duration-200"
                    >
                      Ver todo
                    </Link>
                  </div>
                ))}

                <div />

                <Link
                  href={editorial.cta_href}
                  onClick={() => setMegaOpen(false)}
                  className="col-span-2 relative aspect-[4/3] overflow-hidden group block"
                >
                  <Image
                    src={editorialImages.megaMenu}
                    alt={editorial.title}
                    fill
                    className="object-cover transition-transform duration-[800ms] ease-luxury group-hover:scale-[1.04]"
                    sizes="(max-width: 1600px) 40vw, 640px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
                  <div className="absolute inset-0 flex items-end p-6">
                    <div>
                      <p className="font-display text-lg text-white drop-shadow-sm">{editorial.title}</p>
                      <p className="font-body text-[12px] text-white/85 mt-1">Explorá la colección</p>
                    </div>
                  </div>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile nav */}
        <nav
          aria-label="Principal móvil"
          className="flex md:hidden items-center justify-between h-[60px] px-5"
        >
          <button
            type="button"
            aria-label="Abrir menú"
            onClick={() => setMobileOpen(true)}
            className={cn(
              'min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-sm touch-manipulation focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
              atopDarkHero ? 'text-white/95 focus-visible:outline-white/70' : 'text-charcoal focus-visible:outline-charcoal/30'
            )}
          >
            <Menu className="h-5 w-5" strokeWidth={1.25} />
          </button>

          <Link
            href="/"
            className={cn(
              'font-display text-[19px] tracking-[0.12em] transition-colors duration-300',
              atopDarkHero ? 'text-white' : 'text-charcoal'
            )}
          >
            {identity.logo_url ? (
              <img src={identity.logo_url} alt={identity.store_name} className="h-7 w-auto object-contain" />
            ) : (
              identity.store_name
            )}
          </Link>

          <div className="flex items-center">
            <button
              type="button"
              aria-label="Buscar"
              onClick={() => setSearchOpen(true)}
              className={cn(
                'min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-sm touch-manipulation focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
                atopDarkHero ? 'text-white/95 focus-visible:outline-white/70' : 'text-charcoal focus-visible:outline-charcoal/30'
              )}
            >
              <Search className="h-5 w-5" strokeWidth={1.25} />
            </button>
            <button
              type="button"
              aria-label="Bolsa de compras"
              className={cn(
                'relative min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-sm touch-manipulation focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
                atopDarkHero ? 'text-white/95 focus-visible:outline-white/70' : 'text-charcoal focus-visible:outline-charcoal/30'
              )}
              onClick={() => setCartOpen(true)}
            >
              <ShoppingBag className="h-5 w-5" strokeWidth={1.25} />
              {mounted && itemCount > 0 && (
                <span
                  className={cn(
                    'absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] px-0.5 items-center justify-center text-[9px] font-body font-medium rounded-full tabular-nums',
                    atopDarkHero ? 'bg-white text-charcoal border border-white/40' : 'bg-charcoal text-white'
                  )}
                >
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Overlay Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed inset-0 z-[60] bg-white flex flex-col md:hidden"
          >
            <div className="flex items-center justify-between h-14 px-5 border-b border-pale-gray/80">
              <span className="font-body text-[10px] uppercase tracking-[0.2em] text-warm-gray">Menú</span>
              <button
                type="button"
                aria-label="Cerrar menú"
                onClick={() => setMobileOpen(false)}
                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-charcoal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal/30 rounded-sm"
              >
                <X className="h-5 w-5" strokeWidth={1.25} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center gap-8 py-10 px-6">
              {[...NAV_LINKS, ...CATEGORIES.slice(0, 4)].map((link, i) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="font-display text-[26px] md:text-[28px] text-charcoal tracking-[0.04em] text-center block"
                  >
                    {link.label.charAt(0) + link.label.slice(1).toLowerCase()}
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-6 pb-10 pt-4 border-t border-pale-gray/60">
              <button
                type="button"
                aria-label="Buscar"
                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-charcoal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal/30 rounded-sm"
                onClick={() => { setMobileOpen(false); setSearchOpen(true) }}
              >
                <Search className="h-5 w-5" strokeWidth={1.25} />
              </button>
              <button type="button" aria-label="Favoritos" className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-charcoal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal/30 rounded-sm">
                <Heart className="h-5 w-5" strokeWidth={1.25} />
              </button>
              <Link
                href="/auth/login"
                aria-label="Cuenta"
                onClick={() => setMobileOpen(false)}
                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-charcoal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal/30 rounded-sm"
              >
                <User className="h-5 w-5" strokeWidth={1.25} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
