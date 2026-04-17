'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus, Trash2 } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import { formatPrice } from '@/lib/utils'
import { getPrimaryProductImageUrl } from '@/lib/editorial-images'
import Button from '@/components/ui/Button'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const items = useCartStore((s) => s.items)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const getTotal = useCartStore((s) => s.getTotal)
  const getItemCount = useCartStore((s) => s.getItemCount)

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-[4px]"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed top-0 right-0 bottom-0 z-[80] w-full max-w-[420px] bg-white flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Bolsa de compras"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-pale-gray">
              <div className="flex items-center gap-3">
                <span className="font-body text-[12px] uppercase tracking-[0.12em] text-charcoal font-medium">
                  Tu bolsa
                </span>
                <span className="font-body text-[12px] text-warm-gray">
                  ({getItemCount()})
                </span>
              </div>
              <button
                onClick={onClose}
                className="text-warm-gray hover:text-charcoal transition-colors duration-200"
                aria-label="Cerrar bolsa"
              >
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>

            {/* Items */}
            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
                <p className="font-body text-[14px] text-warm-gray">
                  Tu bolsa está vacía
                </p>
                <Button variant="secondary" onClick={onClose}>
                  Seguir comprando
                </Button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <div className="flex flex-col divide-y divide-pale-gray">
                    {items.map((item) => (
                      <div
                        key={item.variant.id}
                        className="flex gap-4 py-5 first:pt-0"
                      >
                        {/* Image */}
                        <div className="relative w-20 h-[100px] bg-cream shrink-0 overflow-hidden">
                          <Image
                            src={getPrimaryProductImageUrl(item.product)}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div>
                            <p className="font-body text-[14px] text-charcoal leading-tight truncate">
                              {item.product.name}
                            </p>
                            <p className="font-body text-[12px] text-warm-gray mt-1">
                              {item.variant.color} / {item.variant.size}
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            {/* Quantity */}
                            <div className="flex items-center border border-pale-gray">
                              <button
                                onClick={() =>
                                  updateQuantity(item.variant.id, item.quantity - 1)
                                }
                                className="p-1.5 text-warm-gray hover:text-charcoal transition-colors"
                                aria-label="Disminuir cantidad"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="px-3 font-body text-[12px] text-charcoal min-w-[28px] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.variant.id, item.quantity + 1)
                                }
                                className="p-1.5 text-warm-gray hover:text-charcoal transition-colors"
                                aria-label="Aumentar cantidad"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>

                            {/* Price */}
                            <span className="font-body text-[13px] text-charcoal">
                              {formatPrice(item.product.price * item.quantity)}
                            </span>
                          </div>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeItem(item.variant.id)}
                          className="self-start text-warm-gray hover:text-muted-red transition-colors duration-200 mt-0.5"
                          aria-label={`Remove ${item.product.name}`}
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-pale-gray px-6 py-5">
                  <div className="flex items-center justify-between mb-5">
                    <span className="font-body text-[12px] uppercase tracking-[0.1em] text-warm-gray">
                      Subtotal
                    </span>
                    <span className="font-body text-[16px] text-charcoal font-medium">
                      {formatPrice(getTotal())}
                    </span>
                  </div>
                  <Link href="/checkout" onClick={onClose}>
                    <Button fullWidth>Finalizar compra</Button>
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
