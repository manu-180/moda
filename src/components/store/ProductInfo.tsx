'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Plus, Minus } from 'lucide-react'
import type { Product, Category } from '@/types'
import { useCartStore } from '@/lib/store/cart'
import { useWishlistStore } from '@/lib/store/wishlist'
import { formatPrice, cn } from '@/lib/utils'
import Button from '@/components/ui/Button'

const ease = [0.25, 0.1, 0.25, 1] as const

const ACCORDION_SECTIONS = [
  {
    id: 'description',
    title: 'Descripción',
    getContent: (p: Product) =>
      `${p.description}\n\nComposición: tejidos naturales premium\nCuidado: se recomienda limpieza en seco\nHecho en Argentina`,
  },
  {
    id: 'size-fit',
    title: 'Talle y calce',
    getContent: () =>
      'Calce fiel al talle. La modelo usa talle S, altura 178 cm.\n\nPara un calce óptimo, recomendamos tu talle habitual. Consultá nuestra guía de talles para medidas detalladas.',
  },
  {
    id: 'shipping',
    title: 'Envíos y devoluciones',
    getContent: () =>
      'Envío bonificado en compras superiores a USD 500.\nEnvío estándar: 5–7 días hábiles.\nEnvío express: 2–3 días hábiles.\n\nDevoluciones gratuitas dentro de los 30 días desde la entrega. Las prendas deben estar sin uso y con etiquetas.',
  },
]

interface ProductInfoProps {
  product: Product
  category?: Category | null
}

export default function ProductInfo({ product, category }: ProductInfoProps) {
  const addItem = useCartStore((s) => s.addItem)
  const hasSale = product.compare_at_price && product.compare_at_price > product.price

  // Unique colors & sizes
  const uniqueColors = product.variants?.reduce<{ color: string; hex: string }[]>((acc, v) => {
    if (!acc.find((c) => c.color === v.color)) acc.push({ color: v.color, hex: v.color_hex })
    return acc
  }, []) || []

  const [selectedColor, setSelectedColor] = useState(uniqueColors[0]?.color || '')
  const [selectedSize, setSelectedSize] = useState('')
  const [sizeError, setSizeError] = useState(false)
  const [addState, setAddState] = useState<'idle' | 'loading' | 'success'>('idle')
  const [openAccordion, setOpenAccordion] = useState<string | null>(null)
  const { toggleItem, isWishlisted } = useWishlistStore()
  const wishlisted = isWishlisted(product.id)

  // Sizes available for selected color
  const sizesForColor = product.variants
    ?.filter((v) => v.color === selectedColor)
    .reduce<{ size: string; stock: number; id: string }[]>((acc, v) => {
      if (!acc.find((s) => s.size === v.size)) acc.push({ size: v.size, stock: v.stock, id: v.id })
      return acc
    }, []) || []

  const selectedVariant = product.variants?.find(
    (v) => v.color === selectedColor && v.size === selectedSize
  )
  const isOutOfStock = selectedVariant ? selectedVariant.stock === 0 : false
  const noStockAtAll = product.variants?.every((v) => v.stock === 0)

  function handleAddToBag() {
    if (!selectedSize) {
      setSizeError(true)
      return
    }
    if (!selectedVariant || selectedVariant.stock === 0) return

    setAddState('loading')
    setTimeout(() => {
      addItem(product, selectedVariant, 1)
      setAddState('success')
      setTimeout(() => setAddState('idle'), 2000)
    }, 600)
  }

  return (
    <div className="lg:sticky lg:top-[100px]">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <ol className="flex items-center gap-2 font-body text-[11px] text-warm-gray flex-wrap">
          <li><Link href="/" className="hover:text-charcoal transition-colors">Inicio</Link></li>
          <li>/</li>
          {category && (
            <>
              <li><Link href={`/products?category=${category.slug}`} className="hover:text-charcoal transition-colors">{category.name}</Link></li>
              <li>/</li>
            </>
          )}
          <li className="text-dark-gray truncate max-w-[200px]">{product.name}</li>
        </ol>
      </nav>

      {/* Name */}
      <h1 className="font-display text-[26px] md:text-[28px] text-charcoal leading-[1.2] mb-3">
        {product.name}
      </h1>

      {/* Price */}
      <div className="flex items-center gap-3 mb-5">
        {hasSale ? (
          <>
            <span className="font-body text-[18px] text-muted-red">{formatPrice(product.price)}</span>
            <span className="font-body text-[15px] text-warm-gray line-through">{formatPrice(product.compare_at_price!)}</span>
          </>
        ) : (
          <span className="font-body text-[18px] text-dark-gray">{formatPrice(product.price)}</span>
        )}
      </div>

      {/* Short description */}
      <p className="font-body text-[14px] text-dark-gray leading-[1.6] mb-8 line-clamp-3">
        {product.description}
      </p>

      {/* Color selector */}
      {uniqueColors.length > 1 && (
        <div className="mb-7">
          <p className="font-body text-[12px] uppercase tracking-[0.1em] text-charcoal mb-3">
            Color — <span className="text-warm-gray normal-case tracking-normal">{selectedColor}</span>
          </p>
          <div className="flex items-center gap-2.5">
            {uniqueColors.map((c) => (
              <button
                key={c.color}
                onClick={() => { setSelectedColor(c.color); setSelectedSize(''); setSizeError(false) }}
                className={cn(
                  'h-7 w-7 rounded-full transition-all duration-200',
                  selectedColor === c.color
                    ? 'ring-2 ring-charcoal ring-offset-2'
                    : 'ring-1 ring-pale-gray hover:ring-warm-gray'
                )}
                style={{ backgroundColor: c.hex }}
                title={c.color}
              />
            ))}
          </div>
        </div>
      )}

      {/* Size selector */}
      <div className="mb-7">
        <div className="flex items-center justify-between mb-3">
          <p className="font-body text-[12px] uppercase tracking-[0.1em] text-charcoal">Talle</p>
          <button className="font-body text-[11px] uppercase tracking-[0.08em] text-warm-gray underline underline-offset-2 hover:text-charcoal transition-colors">
            Guía de talles
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {sizesForColor.map((s) => (
            <button
              key={s.size}
              disabled={s.stock === 0}
              onClick={() => { setSelectedSize(s.size); setSizeError(false) }}
              className={cn(
                'relative h-11 min-w-[56px] px-4 font-body text-[13px] border transition-all duration-200',
                selectedSize === s.size
                  ? 'bg-charcoal text-white border-charcoal'
                  : s.stock === 0
                    ? 'border-pale-gray text-warm-gray/40 cursor-not-allowed'
                    : sizeError
                      ? 'border-muted-red text-dark-gray'
                      : 'border-pale-gray text-dark-gray hover:border-charcoal'
              )}
            >
              {s.size}
              {s.stock === 0 && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="block w-full h-[1px] bg-warm-gray/40 rotate-[-20deg]" />
                </span>
              )}
            </button>
          ))}
        </div>
        {sizeError && (
          <p className="font-body text-[12px] text-muted-red mt-2">Elegí un talle</p>
        )}
      </div>

      {/* Add to bag */}
      <Button
        fullWidth
        disabled={noStockAtAll || isOutOfStock}
        loading={addState === 'loading'}
        onClick={handleAddToBag}
        className="h-[52px] mb-3"
      >
        {noStockAtAll
          ? 'Sin stock'
          : addState === 'success'
            ? 'Agregado ✓'
            : 'Agregar a la bolsa'}
      </Button>

      {/* Wishlist */}
      <button
        onClick={() => toggleItem(product.id)}
        className={cn(
          'w-full h-[48px] flex items-center justify-center gap-2 border transition-all duration-[400ms] ease-luxury font-body text-[12px] uppercase tracking-[0.1em] mb-10',
          wishlisted
            ? 'border-charcoal bg-charcoal text-white'
            : 'border-charcoal text-charcoal hover:bg-charcoal hover:text-white'
        )}
      >
        <Heart className={cn('h-4 w-4', wishlisted && 'fill-current')} strokeWidth={1.5} />
        {wishlisted ? 'En favoritos' : 'Agregar a favoritos'}
      </button>

      {/* Accordion */}
      <div className="border-t border-pale-gray">
        {ACCORDION_SECTIONS.map((section) => {
          const isOpen = openAccordion === section.id
          return (
            <div key={section.id} className="border-b border-pale-gray">
              <button
                onClick={() => setOpenAccordion(isOpen ? null : section.id)}
                className="w-full flex items-center justify-between py-5"
              >
                <span className="font-body text-[12px] uppercase tracking-[0.12em] text-charcoal">
                  {section.title}
                </span>
                {isOpen ? (
                  <Minus className="h-4 w-4 text-warm-gray" strokeWidth={1.5} />
                ) : (
                  <Plus className="h-4 w-4 text-warm-gray" strokeWidth={1.5} />
                )}
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease }}
                    className="overflow-hidden"
                  >
                    <p className="font-body text-[14px] text-dark-gray leading-[1.7] pb-6 whitespace-pre-line">
                      {section.getContent(product)}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}
