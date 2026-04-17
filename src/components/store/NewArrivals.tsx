'use client'

import Link from 'next/link'
import type { Product } from '@/types'
import ProductCard from './ProductCard'

interface NewArrivalsProps {
  products: Product[]
}

export default function NewArrivals({ products }: NewArrivalsProps) {
  // Take up to 8 for desktop layout
  const items = products.slice(0, 8)

  return (
    <section className="py-20 md:py-[120px] bg-soft-white px-6 md:px-16 lg:px-20">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-14 md:mb-20 gap-4">
          <div className="flex flex-col items-start">
            <h2 className="font-display italic text-charcoal text-[36px] md:text-[48px] lg:text-[56px] leading-[1.1]">
              Novedades.
            </h2>
            <div className="flex items-center gap-3 mt-4">
              <div className="w-10 h-[1px]" style={{ background: 'var(--color-brand-primary)' }} />
              <span className="font-body text-[10px] uppercase tracking-[0.22em] text-warm-gray">
                FW 2025
              </span>
            </div>
          </div>
          <Link
            href="/collections/new-arrivals"
            className="group font-body text-[11px] uppercase tracking-[0.18em] text-warm-gray hover:text-charcoal transition-colors duration-300 mb-1"
          >
            <span className="relative">
              Ver todo
              <span className="absolute -bottom-0.5 left-0 h-[1px] w-0 bg-charcoal transition-all duration-300 group-hover:w-full" />
            </span>
          </Link>
        </div>

        {/* Desktop editorial grid */}
        <div className="hidden md:grid grid-cols-4 auto-rows-auto gap-6" style={{
          gridTemplateRows: 'auto auto',
        }}>
          {/* Item 0: large — spans 2 cols, 2 rows */}
          {items[0] && (
            <div className="col-span-2 row-span-2">
              <ProductCard product={items[0]} index={0} variant="large" />
            </div>
          )}

          {/* Items 1-4: normal, fill right side */}
          {items[1] && (
            <div>
              <ProductCard product={items[1]} index={1} />
            </div>
          )}
          {items[2] && (
            <div>
              <ProductCard product={items[2]} index={2} />
            </div>
          )}
          {items[3] && (
            <div>
              <ProductCard product={items[3]} index={3} />
            </div>
          )}
          {items[4] && (
            <div>
              <ProductCard product={items[4]} index={4} />
            </div>
          )}

          {/* Row 3: normal, normal, then large spanning 2 cols */}
          {items[5] && (
            <div>
              <ProductCard product={items[5]} index={5} />
            </div>
          )}
          {items[6] && (
            <div>
              <ProductCard product={items[6]} index={6} />
            </div>
          )}
          {items[7] && (
            <div className="col-span-2 row-span-2">
              <ProductCard product={items[7]} index={7} variant="large" />
            </div>
          )}
        </div>

        {/* Mobile 2-column grid */}
        <div className="grid md:hidden grid-cols-2 gap-4">
          {items.slice(0, 6).map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>

        {/* Mobile View All */}
        <div className="flex md:hidden justify-center mt-10">
          <Link
            href="/collections/new-arrivals"
            className="inline-block border border-charcoal text-charcoal font-body text-[12px] uppercase tracking-[0.12em] px-8 py-3 transition-all duration-[400ms] ease-luxury hover:bg-charcoal hover:text-white"
          >
            Ver todas las novedades
          </Link>
        </div>
      </div>
    </section>
  )
}
