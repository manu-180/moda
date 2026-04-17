'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import type { Product } from '@/types'
import { useCartStore } from '@/lib/store/cart'
import { formatPrice, cn } from '@/lib/utils'
import {
  productFallbackUrl,
  getPrimaryProductImageUrl,
  isRemoteImageUrl,
} from '@/lib/editorial-images'

interface ProductCardProps {
  product: Product
  index?: number
  variant?: 'default' | 'large'
}

const ease = [0.25, 0.1, 0.25, 1] as const

export default function ProductCard({
  product,
  index = 0,
  variant = 'default',
}: ProductCardProps) {
  const [hovered, setHovered] = useState(false)
  const [showSizes, setShowSizes] = useState(false)
  const addItem = useCartStore((s) => s.addItem)

  const db0 = product.images?.[0]?.url?.trim()
  const db1 = product.images?.[1]?.url?.trim()
  const img1 = getPrimaryProductImageUrl(product)
  const hasValidPrimary = isRemoteImageUrl(db0)
  const hasValidSecondary = isRemoteImageUrl(db1)
  const img2 = hasValidSecondary
    ? db1!
    : !hasValidPrimary
      ? productFallbackUrl(product.slug, 1)
      : undefined
  const hasSale = product.compare_at_price && product.compare_at_price > product.price
  const isLarge = variant === 'large'

  // Unique colors from variants
  const uniqueColors = product.variants
    ?.reduce<{ color: string; hex: string }[]>((acc, v) => {
      if (!acc.find((c) => c.hex === v.color_hex)) {
        acc.push({ color: v.color, hex: v.color_hex })
      }
      return acc
    }, [])
    .slice(0, 4)

  const extraColorCount =
    (product.variants?.reduce<Set<string>>((s, v) => s.add(v.color_hex), new Set()).size || 0) - 4

  // Unique sizes with stock info
  const sizes = product.variants
    ?.reduce<{ size: string; stock: number; variantId: string }[]>((acc, v) => {
      if (!acc.find((s) => s.size === v.size)) {
        acc.push({ size: v.size, stock: v.stock, variantId: v.id })
      }
      return acc
    }, [])

  function handleQuickAdd(sizeEntry: { size: string; variantId: string }) {
    const selectedVariant = product.variants?.find((v) => v.id === sizeEntry.variantId)
    if (selectedVariant) {
      addItem(product, selectedVariant, 1)
      setShowSizes(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ amount: 0.2, once: true }}
      transition={{ delay: index * 0.1, duration: 0.8, ease }}
    >
      <div
        className="group"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => {
          setHovered(false)
          setShowSizes(false)
        }}
      >
        {/* Image container */}
        <Link href={`/products/${product.slug}`} className="block">
          <div className="relative aspect-[3/4] overflow-hidden bg-cream">
            {/* Primary image — pure crossfade, no zoom (luxury standard) */}
            <Image
              src={img1}
              alt={product.images?.[0]?.alt || product.name}
              fill
              className={cn(
                'object-cover transition-opacity duration-[500ms] ease-luxury',
                hovered && img2 && 'opacity-0'
              )}
              sizes={isLarge ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 50vw, 25vw'}
            />

            {/* Secondary image (crossfade only — no scale) */}
            {img2 && (
              <Image
                src={img2}
                alt={product.images?.[1]?.alt || product.name}
                fill
                className={cn(
                  'object-cover transition-opacity duration-[500ms] ease-luxury',
                  hovered ? 'opacity-100' : 'opacity-0'
                )}
                sizes={isLarge ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 50vw, 25vw'}
              />
            )}

            {/* Quick Add overlay — minimal, luxury language */}
            <div
              className={cn(
                'absolute bottom-0 left-0 right-0 z-10 transition-all duration-300 ease-luxury',
                hovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
              )}
            >
              {!showSizes ? (
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setShowSizes(true)
                  }}
                  className="w-full bg-white/95 py-3 font-body text-[11px] uppercase tracking-[0.15em] text-charcoal hover:bg-white transition-colors duration-200"
                >
                  Seleccionar talla
                </button>
              ) : (
                <div
                  className="w-full bg-white/95 py-3 px-4"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                >
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    {sizes?.map((s) => (
                      <button
                        key={s.size}
                        disabled={s.stock === 0}
                        onClick={() => handleQuickAdd(s)}
                        className={cn(
                          'min-w-[36px] py-1.5 px-2 font-body text-[11px] border transition-colors duration-200',
                          s.stock === 0
                            ? 'border-pale-gray text-warm-gray line-through cursor-not-allowed'
                            : 'border-pale-gray text-charcoal hover:border-charcoal hover:bg-charcoal hover:text-white'
                        )}
                      >
                        {s.size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Link>

        {/* Product info */}
        <div className="mt-3">
          <Link href={`/products/${product.slug}`}>
            <p
              className={cn(
                'font-body text-charcoal leading-tight truncate transition-all duration-200',
                isLarge ? 'text-[15px]' : 'text-[13px]',
                'group-hover:underline underline-offset-2 decoration-pale-gray'
              )}
            >
              {product.name}
            </p>
          </Link>

          {/* Price */}
          <div className="flex items-center gap-2 mt-1.5">
            {hasSale ? (
              <>
                <span className="font-body text-[13px] text-muted-red">
                  {formatPrice(product.price)}
                </span>
                <span className="font-body text-[12px] text-warm-gray line-through">
                  {formatPrice(product.compare_at_price!)}
                </span>
              </>
            ) : (
              <span className={cn('font-body text-dark-gray', isLarge ? 'text-[15px]' : 'text-[14px]')}>
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Color dots */}
          {uniqueColors && uniqueColors.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2">
              {uniqueColors.map((c) => (
                <span
                  key={c.hex}
                  title={c.color}
                  className="h-2.5 w-2.5 rounded-full border border-pale-gray"
                  style={{ backgroundColor: c.hex }}
                />
              ))}
              {extraColorCount > 0 && (
                <span className="font-body text-[10px] text-warm-gray ml-0.5">
                  +{extraColorCount}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
