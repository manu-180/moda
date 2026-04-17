'use client'

import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import Button from '@/components/ui/Button'
import { editorialImages } from '@/lib/editorial-images'
import { useSiteConfig } from '@/lib/site-config-context'

const ease = [0.25, 0.1, 0.25, 1] as const

export default function EditorialSection() {
  const { editorial } = useSiteConfig()
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const imgY = useTransform(scrollYProgress, [0, 1], ['-10%', '10%'])

  return (
    <section
      ref={sectionRef}
      className="flex flex-col md:flex-row min-h-[60vh] md:min-h-[80vh]"
    >
      {/* Image — 55% */}
      <motion.div
        initial={{ clipPath: 'inset(0 100% 0 0)' }}
        whileInView={{ clipPath: 'inset(0 0% 0 0)' }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.2, ease }}
        className="relative w-full md:w-[55%] aspect-[4/3] md:aspect-auto overflow-hidden"
      >
        <motion.div className="absolute inset-0" style={{ y: imgY }}>
          <Image
            src={editorialImages.editorialAutumn}
            alt={editorial.title}
            fill
            className="object-cover object-[center_30%]"
            sizes="(max-width: 768px) 100vw, 55vw"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#2a2419]/25 via-transparent to-[#8B7355]/20" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <filter id="editorial-noise">
              <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#editorial-noise)" />
          </svg>
        </motion.div>
      </motion.div>

      {/* Content — 45% */}
      <div className="w-full md:w-[45%] bg-ivory flex items-center relative">
        {/* Champagne vertical accent line */}
        <div
          className="absolute left-0 top-1/4 bottom-1/4 w-[1.5px] hidden md:block"
          style={{ background: 'linear-gradient(to bottom, transparent, var(--color-brand-primary), transparent)', opacity: 0.5 }}
        />
        <div className="px-8 md:px-16 lg:px-20 py-12 md:py-20 max-w-[560px]">
          {editorial.season_label && (
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ delay: 0.3, duration: 0.8, ease }}
              className="font-body text-[11px] uppercase tracking-[0.2em] text-champagne mb-5"
            >
              {editorial.season_label}
            </motion.p>
          )}

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: 0.5, duration: 1, ease }}
            className="font-display italic text-charcoal text-[32px] md:text-[42px] lg:text-[48px] leading-[1.15] mb-6"
          >
            {editorial.title}
          </motion.h2>

          {editorial.description && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ delay: 0.7, duration: 0.8, ease }}
              className="font-body text-[14px] md:text-[15px] font-light text-dark-gray leading-[1.7] mb-8"
            >
              {editorial.description}
            </motion.p>
          )}

          {/* Decorative divider before CTA */}
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: 40 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: 0.85, duration: 0.8, ease }}
            className="h-px mb-8"
            style={{ background: 'var(--color-brand-primary)' }}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: 0.9, duration: 0.8, ease }}
          >
            <Link href={editorial.cta_href}>
              <Button>Explorar la colección</Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
