'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { editorialImages } from '@/lib/editorial-images'
import { useSiteConfig } from '@/lib/site-config-context'

const ease = [0.25, 0.1, 0.25, 1] as const

export default function HeroSection() {
  const { hero } = useSiteConfig()
  const [scrollIndicatorVisible, setScrollIndicatorVisible] = useState(true)
  const { scrollY } = useScroll()
  const bgY = useTransform(scrollY, [0, 800], [0, 400])

  useEffect(() => {
    const onScroll = () => setScrollIndicatorVisible(window.scrollY < 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const titleWords = hero.title.split(' ').filter(Boolean)
  const heroImage = hero.image_url || editorialImages.hero

  return (
    <section className="relative h-screen w-full overflow-hidden -mt-[88px] md:-mt-[104px]">
      {/* Background with parallax */}
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        <Image
          src={heroImage}
          alt={`${hero.title} — hero`}
          fill
          priority
          className="object-cover object-[center_25%] scale-[1.02]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0e0a07]/70 via-[#16100c]/30 to-[#0c0809]/60" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.035]" xmlns="http://www.w3.org/2000/svg">
          <filter id="hero-noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#hero-noise)" />
        </svg>
      </motion.div>

      {/* Bottom gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(14,10,7,0.65) 0%, rgba(0,0,0,0.08) 55%, transparent 100%)' }}
      />

      {/* Decorative rotating diamond ornament — top right */}
      <motion.div
        className="absolute top-6 right-6 md:top-12 md:right-14 z-20 pointer-events-none"
        initial={{ opacity: 0, scale: 0, rotate: 0 }}
        animate={{ opacity: 0.4, scale: 1, rotate: 45 }}
        transition={{ delay: 2, duration: 1.4, ease }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          style={{ originX: '50%', originY: '50%' }}
        >
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 1 L35 18 L18 35 L1 18 Z" stroke="white" strokeWidth="0.6" fill="none" />
            <path d="M18 7 L29 18 L18 29 L7 18 Z" stroke="white" strokeWidth="0.4" fill="none" opacity="0.6" />
            <circle cx="18" cy="18" r="1.8" fill="white" fillOpacity="0.5" />
          </svg>
        </motion.div>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 flex h-full min-h-0 flex-col px-6 pb-20 pt-[calc(88px+12px)] max-[480px]:pb-16 md:px-16 md:pb-28 md:pt-[calc(104px+16px)] lg:px-20 lg:pb-32 max-w-[1600px] mx-auto">
        <div className="min-h-0 flex-1" aria-hidden />
        <div className="max-w-2xl shrink-0 pb-[env(safe-area-inset-bottom,0px)]">
          {/* Season tag with gold accent line */}
          {hero.season_label && (
            <div className="flex items-center gap-4 mb-5 md:mb-7">
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 28, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.9, ease }}
                className="h-px shrink-0"
                style={{ background: 'var(--color-brand-primary)' }}
              />
              <motion.p
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 0.75, x: 0 }}
                transition={{ delay: 0.4, duration: 0.8, ease }}
                className="font-body text-[10px] uppercase tracking-[0.28em] text-white"
              >
                {hero.season_label}
              </motion.p>
            </div>
          )}

          {/* Title — word-by-word stagger */}
          <h1 className="font-display italic text-white text-[36px] min-[400px]:text-[42px] md:text-[64px] lg:text-[80px] xl:text-[96px] leading-[1.05] mb-5 md:mb-7">
            {titleWords.map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1, duration: 1, ease }}
                className="inline-block mr-[0.28em] last:mr-0"
              >
                {word}
              </motion.span>
            ))}
          </h1>

          {/* Subtitle */}
          {hero.subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 0.75, y: 0 }}
              transition={{ delay: 1, duration: 0.8, ease }}
              className="font-body text-[14px] md:text-[15px] font-light text-white max-w-[420px] leading-[1.75] mb-7 md:mb-10 tracking-wide"
            >
              {hero.subtitle}
            </motion.p>
          )}

          {/* CTA */}
          {hero.cta_text && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.8, ease }}
            >
              <Link
                href={hero.cta_href}
                className="inline-block relative overflow-hidden border font-body text-[11px] uppercase tracking-[0.2em] px-11 py-4 transition-all duration-[500ms] ease-luxury group"
                style={{
                  borderColor: 'rgba(196,162,101,0.8)',
                  color: 'white',
                }}
              >
                <span
                  className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-[500ms] ease-luxury"
                  style={{ background: 'var(--color-brand-primary)' }}
                />
                <span className="relative z-10">{hero.cta_text}</span>
              </Link>
            </motion.div>
          )}
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        animate={{ opacity: scrollIndicatorVisible ? 1 : 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          className="w-[1px] h-10 bg-white/50"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <span className="font-body text-[9px] uppercase tracking-[0.15em] text-white/50">
          Deslizá
        </span>
      </motion.div>
    </section>
  )
}
