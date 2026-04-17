'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import { formatPrice, cn } from '@/lib/utils'
import { getPrimaryProductImageUrl } from '@/lib/editorial-images'
import Button from '@/components/ui/Button'
import { useSiteConfig } from '@/lib/site-config-context'

const ease = [0.25, 0.1, 0.25, 1] as const

export default function CartPageContent() {
  const items = useCartStore((s) => s.items)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const getTotal = useCartStore((s) => s.getTotal)
  const getItemCount = useCartStore((s) => s.getItemCount)

  const { commerce } = useSiteConfig()

  // Hydration guard
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null
  const subtotal = getTotal()
  const shipping = subtotal >= commerce.free_shipping_threshold ? 0 : commerce.shipping_standard
  const tax = Math.round(subtotal * commerce.tax_rate * 100) / 100
  const total = subtotal + shipping + tax

  if (items.length === 0) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 md:px-16 py-20 text-center">
        <h1 className="font-display italic text-[26px] md:text-[28px] text-charcoal mb-4">
          Tu bolsa está vacía
        </h1>
        <p className="font-body text-[14px] text-warm-gray mb-8">
          Descubrí nuestra última colección
        </p>
        <Link href="/products">
          <Button>Seguir comprando</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 md:px-16 py-8 md:py-14">
      {/* Header */}
      <div className="flex items-baseline gap-3 mb-10">
        <h1 className="font-display text-[28px] md:text-[32px] text-charcoal">Tu bolsa</h1>
        <span className="font-body text-[14px] text-warm-gray">
          ({getItemCount()} {getItemCount() === 1 ? 'artículo' : 'artículos'})
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">
        {/* Items — 65% */}
        <div className="flex-1">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.div
                key={item.variant.id}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.3, ease }}
                className="mb-0"
              >
                <div className="flex gap-5 py-6 border-b border-pale-gray">
                  {/* Image */}
                  <div className="relative w-[80px] h-[100px] md:w-[120px] md:h-[150px] bg-cream shrink-0 overflow-hidden">
                    <Image
                      src={getPrimaryProductImageUrl(item.product)}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="120px"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <Link href={`/products/${item.product.slug}`} className="font-body text-[14px] text-charcoal hover:underline underline-offset-2 leading-tight">
                        {item.product.name}
                      </Link>
                      <p className="font-body text-[12px] text-warm-gray mt-1">
                        {item.variant.color} / {item.variant.size}
                      </p>
                      <p className="font-body text-[14px] text-dark-gray mt-1.5">
                        {formatPrice(item.product.price)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      {/* Quantity */}
                      <div className="flex items-center border border-pale-gray">
                        <button
                          onClick={() => updateQuantity(item.variant.id, item.quantity - 1)}
                          className="p-2 text-warm-gray hover:text-charcoal transition-colors"
                          aria-label="Disminuir"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="px-4 font-body text-[13px] text-charcoal min-w-[32px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variant.id, item.quantity + 1)}
                          className="p-2 text-warm-gray hover:text-charcoal transition-colors"
                          aria-label="Aumentar"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Subtotal */}
                      <span className="font-body text-[14px] text-charcoal hidden md:block">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.variant.id)}
                    className="self-start text-warm-gray hover:text-muted-red transition-colors duration-200 p-1"
                    aria-label={`Remove ${item.product.name}`}
                  >
                    <X className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <Link
            href="/products"
            className="inline-block mt-6 font-body text-[12px] uppercase tracking-[0.1em] text-warm-gray hover:text-charcoal transition-colors group"
          >
            <span className="relative">
              ← Seguir comprando
              <span className="absolute -bottom-0.5 left-0 h-[1px] w-0 bg-charcoal transition-all duration-300 group-hover:w-full" />
            </span>
          </Link>
        </div>

        {/* Summary — 35% */}
        <div className="w-full lg:w-[35%] lg:shrink-0">
          <div className="bg-ivory p-8 md:p-10 lg:sticky lg:top-[100px]">
            <h2 className="font-body text-[12px] uppercase tracking-[0.12em] text-charcoal mb-6">
              Resumen del pedido
            </h2>

            <div className="flex flex-col gap-3 font-body text-[13px]">
              <div className="flex justify-between">
                <span className="text-dark-gray">Subtotal</span>
                <span className="text-charcoal">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-gray">Envío</span>
                <span className={cn('text-charcoal', shipping === 0 && 'text-deep-forest')}>
                  {shipping === 0 ? 'Bonificado' : formatPrice(shipping)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-gray">Impuestos estimados</span>
                <span className="text-charcoal">{formatPrice(tax)}</span>
              </div>
            </div>

            <div className="h-[1px] bg-pale-gray my-5" />

            <div className="flex justify-between mb-7">
              <span className="font-body text-[14px] text-charcoal font-medium">Total</span>
              <span className="font-body text-[16px] text-charcoal font-medium">{formatPrice(total)}</span>
            </div>

            <Link href="/checkout">
              <Button fullWidth>Ir al checkout</Button>
            </Link>

            {subtotal < commerce.free_shipping_threshold && (
              <p className="font-body text-[11px] text-warm-gray mt-4 text-center">
                Agregá {formatPrice(commerce.free_shipping_threshold - subtotal)} más para envío bonificado
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
