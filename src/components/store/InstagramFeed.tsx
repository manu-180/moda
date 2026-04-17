'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Instagram } from 'lucide-react'
import { instagramGridImages } from '@/lib/editorial-images'
import { useSiteConfig } from '@/lib/site-config-context'

const ease = [0.25, 0.1, 0.25, 1] as const

export default function InstagramFeed() {
  const { social } = useSiteConfig()
  const handle = social.instagram_handle || '@maisonelara'
  const igUrl = social.instagram || 'https://instagram.com'

  return (
    <section className="bg-white pt-16 md:pt-[100px]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6, ease }}
        className="flex items-center justify-center gap-2.5 mb-12 md:mb-16"
      >
        <Instagram className="h-4 w-4 text-charcoal" strokeWidth={1.5} />
        <span className="font-body text-[12px] uppercase tracking-[0.15em] text-charcoal">
          Seguinos {handle}
        </span>
      </motion.div>

      {/* Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.8, ease }}
        className="grid grid-cols-3 md:grid-cols-6 gap-[2px]"
      >
        {instagramGridImages.map((item, i) => (
          <a
            key={item.src}
            href={igUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative aspect-square overflow-hidden cursor-pointer"
          >
            <Image
              src={item.src}
              alt={item.alt}
              fill
              className="object-cover transition-transform duration-[600ms] ease-luxury group-hover:scale-105"
              sizes="(max-width: 768px) 33vw, 16vw"
              priority={i < 3}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-[400ms] ease-luxury flex items-center justify-center">
              <div className="flex flex-col items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-[400ms]">
                <Instagram className="h-5 w-5 text-white" strokeWidth={1.5} />
                <span className="font-body text-[10px] uppercase tracking-[0.1em] text-white hidden md:block">
                  Ver publicación
                </span>
              </div>
            </div>
          </a>
        ))}
      </motion.div>
    </section>
  )
}
