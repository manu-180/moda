'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import type { Product, Collection } from '@/types'
import { collectionHeroUrl } from '@/lib/editorial-images'
import ProductCard from './ProductCard'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import Link from 'next/link'

const ease = [0.25, 0.1, 0.25, 1] as const

const SORT_OPTIONS = [
  { label: 'Más recientes', value: 'latest' },
  { label: 'Precio: menor a mayor', value: 'price_asc' },
  { label: 'Precio: mayor a menor', value: 'price_desc' },
  { label: 'Nombre A–Z', value: 'name_asc' },
]

interface Props {
  collection: Collection
  products: Product[]
}

export default function CollectionPageContent({ collection, products }: Props) {
  const [sortBy, setSortBy] = useState('latest')

  const sorted = useMemo(() => {
    const result = [...products]
    switch (sortBy) {
      case 'price_asc': return result.sort((a, b) => a.price - b.price)
      case 'price_desc': return result.sort((a, b) => b.price - a.price)
      case 'name_asc': return result.sort((a, b) => a.name.localeCompare(b.name))
      default: return result
    }
  }, [products, sortBy])

  return (
    <div>
      {/* Hero */}
      <div className="relative h-[50vh] flex items-end overflow-hidden -mt-[72px]">
        <Image
          src={collectionHeroUrl(collection.slug, collection.image_url)}
          alt=""
          fill
          className="object-cover object-[center_32%]"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#2a2218]/75 via-[#4a3d30]/45 to-[#1a1510]/60" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <filter id="col-noise"><feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
          <rect width="100%" height="100%" filter="url(#col-noise)" />
        </svg>
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />

        <div className="relative z-10 max-w-[1600px] mx-auto w-full px-6 md:px-16 lg:px-20 pb-12 md:pb-16">
          {collection.season && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease }}
              className="font-body text-[12px] uppercase tracking-[0.2em] text-champagne mb-3"
            >
              {collection.season}
            </motion.p>
          )}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease }}
            className="font-display text-[36px] md:text-[48px] text-white leading-[1.1]"
          >
            {collection.name}
          </motion.h1>
          {collection.description && (
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 0.8, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6, ease }}
              className="font-body text-[14px] md:text-[15px] text-white/80 mt-4 max-w-[600px] leading-relaxed"
            >
              {collection.description}
            </motion.p>
          )}
        </div>
      </div>

      {/* Products */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-16 lg:px-20 py-10 md:py-16">
        {products.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-display italic text-[22px] text-charcoal mb-4">
              Esta colección llega pronto
            </p>
            <p className="font-body text-[14px] text-warm-gray mb-8">
              Muy pronto nuevas piezas
            </p>
            <Link href="/products"><Button variant="secondary">Ver toda la tienda</Button></Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-10">
              <span className="font-body text-[13px] text-warm-gray">
                {products.length} {products.length === 1 ? 'pieza' : 'piezas'}
              </span>
              <div className="w-[180px]">
                <Select options={SORT_OPTIONS} value={sortBy} onChange={setSortBy} placeholder="Ordenar por" />
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 lg:gap-x-8 gap-y-10 lg:gap-y-12">
              {sorted.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
