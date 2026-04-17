'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import type { Collection } from '@/types'
import { collectionHeroUrl } from '@/lib/editorial-images'

const ease = [0.25, 0.1, 0.25, 1] as const

type Row = Collection & { product_count: number }

interface CollectionsIndexProps {
  collections: Row[]
}

const desktopHeights = [450, 350, 350, 350, 350, 450]

export default function CollectionsIndex({ collections }: CollectionsIndexProps) {
  const sorted = [...collections].sort((a, b) => a.name.localeCompare(b.name, 'es'))

  if (sorted.length === 0) {
    return (
      <div className="max-w-[1600px] mx-auto px-6 md:px-16 lg:px-20 py-20 text-center">
        <p className="font-body text-[14px] text-warm-gray">No hay colecciones activas por el momento.</p>
        <Link
          href="/products"
          className="inline-block mt-6 font-body text-[12px] uppercase tracking-[0.15em] text-charcoal border-b border-charcoal pb-0.5"
        >
          Ver toda la tienda
        </Link>
      </div>
    )
  }

  return (
    <section className="py-16 md:py-[100px] bg-white px-6 md:px-16 lg:px-20">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex flex-col items-center mb-12 md:mb-16">
          <h1 className="font-display text-[28px] md:text-[36px] text-charcoal tracking-tight text-center">
            Colecciones
          </h1>
          <p className="mt-3 font-body text-[14px] text-warm-gray text-center max-w-md">
            Curadas por temporada y estilo.
          </p>
          <div className="w-10 h-[1px] bg-champagne mt-6" />
        </div>

        <div className="hidden md:grid grid-cols-3 gap-4">
          {sorted.map((col, i) => (
            <motion.div
              key={col.id}
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.1, duration: 0.8, ease }}
              style={{ height: desktopHeights[i % desktopHeights.length] || 350 }}
            >
              <Link
                href={`/collections/${col.slug}`}
                className="group relative block h-full w-full overflow-hidden"
              >
                <div className="absolute inset-0">
                  <Image
                    src={collectionHeroUrl(col.slug, col.image_url)}
                    alt={col.name}
                    fill
                    className="object-cover transition-transform duration-[800ms] ease-luxury group-hover:scale-[1.08]"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/20 to-black/25 group-hover:from-black/55 group-hover:to-black/35 transition-all duration-500" />
                <div className="relative h-full flex flex-col items-center justify-center text-center z-10 px-4">
                  <span className="font-body text-[14px] uppercase tracking-[0.15em] text-white">
                    {col.name}
                  </span>
                  {col.season && (
                    <span className="font-body text-[11px] text-white/70 mt-1.5">{col.season}</span>
                  )}
                  <span className="font-body text-[11px] text-white/70 mt-1.5">
                    {col.product_count} {col.product_count === 1 ? 'pieza' : 'piezas'}
                  </span>
                  <span className="block w-0 h-[1px] bg-white mt-2.5 transition-all duration-500 ease-luxury group-hover:w-[30px]" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="grid md:hidden grid-cols-2 gap-3">
          {sorted.map((col, i) => (
            <motion.div
              key={col.id}
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.08, duration: 0.6, ease }}
            >
              <Link
                href={`/collections/${col.slug}`}
                className="group relative block h-[220px] overflow-hidden"
              >
                <div className="absolute inset-0">
                  <Image
                    src={collectionHeroUrl(col.slug, col.image_url)}
                    alt={col.name}
                    fill
                    className="object-cover transition-transform duration-[800ms] ease-luxury group-hover:scale-[1.08]"
                    sizes="50vw"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-black/25" />
                <div className="relative h-full flex flex-col items-center justify-center z-10 px-2 text-center">
                  <span className="font-body text-[12px] uppercase tracking-[0.15em] text-white">
                    {col.name}
                  </span>
                  <span className="font-body text-[10px] text-white/70 mt-1">
                    {col.product_count} piezas
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
