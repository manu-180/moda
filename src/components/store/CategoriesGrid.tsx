'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import type { Category } from '@/types'
import { categoryImageUrl } from '@/lib/editorial-images'

const ease = [0.25, 0.1, 0.25, 1] as const

interface CategoriesGridProps {
  categories: (Category & { product_count?: number })[]
}

// Desktop heights for bento layout: alternating tall/short
const desktopHeights = [450, 350, 350, 350, 350, 450]

export default function CategoriesGrid({ categories }: CategoriesGridProps) {
  const sorted = [...categories].sort((a, b) => a.position - b.position).slice(0, 6)

  return (
    <section className="py-16 md:py-[100px] bg-white px-6 md:px-16 lg:px-20">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center mb-12 md:mb-16">
          <h2 className="font-body text-[12px] uppercase tracking-[0.15em] text-warm-gray">
            Comprar por categoría
          </h2>
          <div className="w-10 h-[1px] bg-champagne mt-3" />
        </div>

        {/* Desktop bento grid */}
        <div className="hidden md:grid grid-cols-3 gap-4">
          {sorted.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.1, duration: 0.8, ease }}
              style={{ height: desktopHeights[i] || 350 }}
            >
              <Link
                href={`/collections/${cat.slug}`}
                className="group relative block h-full w-full overflow-hidden"
              >
                {/* Image / placeholder */}
                <div className="absolute inset-0">
                  <Image
                    src={categoryImageUrl(cat.slug, cat.image_url)}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-[800ms] ease-luxury group-hover:scale-[1.08]"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/20 to-black/25 group-hover:from-black/55 group-hover:to-black/35 transition-all duration-500" />

                {/* Content */}
                <div className="relative h-full flex flex-col items-center justify-center text-center z-10">
                  <span className="font-body text-[14px] uppercase tracking-[0.15em] text-white">
                    {cat.name}
                  </span>
                  {cat.product_count !== undefined && (
                    <span className="font-body text-[11px] text-white/70 mt-1.5">
                      {cat.product_count} {cat.product_count === 1 ? 'pieza' : 'piezas'}
                    </span>
                  )}
                  {/* Hover underline */}
                  <span className="block w-0 h-[1px] bg-white mt-2.5 transition-all duration-500 ease-luxury group-hover:w-[30px]" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Mobile 2-col grid */}
        <div className="grid md:hidden grid-cols-2 gap-3">
          {sorted.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.08, duration: 0.6, ease }}
            >
              <Link
                href={`/collections/${cat.slug}`}
                className="group relative block h-[220px] overflow-hidden"
              >
                <div className="absolute inset-0">
                  <Image
                    src={categoryImageUrl(cat.slug, cat.image_url)}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-[800ms] ease-luxury group-hover:scale-[1.08]"
                    sizes="50vw"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-black/25" />
                <div className="relative h-full flex flex-col items-center justify-center z-10">
                  <span className="font-body text-[12px] uppercase tracking-[0.15em] text-white">
                    {cat.name}
                  </span>
                  {cat.product_count !== undefined && (
                    <span className="font-body text-[10px] text-white/70 mt-1">
                      {cat.product_count} piezas
                    </span>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
