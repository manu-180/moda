'use client'

import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Product } from '@/types'
import ProductCard from './ProductCard'
import { useCallback } from 'react'

interface RelatedProductsProps {
  title: string
  products: Product[]
}

export default function RelatedProducts({ title, products }: RelatedProductsProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    slidesToScroll: 1,
    containScroll: 'trimSnaps',
  })

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  if (products.length === 0) return null

  return (
    <section className="py-16 md:py-20">
      <div className="flex items-center justify-between mb-10">
        <h2 className="font-display italic text-[24px] md:text-[28px] text-charcoal">
          {title}
        </h2>
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={scrollPrev}
            className="h-10 w-10 flex items-center justify-center border border-pale-gray text-warm-gray hover:border-charcoal hover:text-charcoal transition-colors duration-200"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <button
            onClick={scrollNext}
            className="h-10 w-10 flex items-center justify-center border border-pale-gray text-warm-gray hover:border-charcoal hover:text-charcoal transition-colors duration-200"
            aria-label="Siguiente"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex gap-6">
          {products.map((product, i) => (
            <div key={product.id} className="flex-[0_0_70%] md:flex-[0_0_30%] lg:flex-[0_0_23%] min-w-0">
              <ProductCard product={product} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
