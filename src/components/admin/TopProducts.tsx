'use client'

import Image from 'next/image'
import { productFallbackUrl } from '@/lib/editorial-images'
import { formatPrice } from '@/lib/utils'

interface TopProduct {
  name: string
  image_url?: string
  units_sold: number
  revenue: number
}

interface TopProductsProps {
  products: TopProduct[]
}

export default function TopProducts({ products }: TopProductsProps) {
  const maxRevenue = Math.max(...products.map((p) => p.revenue), 1)

  return (
    <div className="bg-white border border-pale-gray rounded-lg p-6">
      <h3 className="font-body text-[12px] uppercase tracking-[0.08em] text-warm-gray mb-6">
        Productos destacados
      </h3>
      <div className="flex flex-col gap-4">
        {products.map((p, i) => {
          const slugKey = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'product'
          const src = p.image_url?.trim() || productFallbackUrl(slugKey, 0)
          return (
          <div key={i} className="flex items-center gap-3">
            <div className="relative h-10 w-10 bg-cream shrink-0 overflow-hidden rounded">
              <Image src={src} alt={p.name} fill className="object-cover" sizes="40px" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-body text-[13px] text-charcoal truncate">{p.name}</p>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex-1 h-1.5 bg-ivory rounded-full overflow-hidden">
                  <div
                    className="h-full bg-champagne rounded-full transition-all duration-500"
                    style={{ width: `${(p.revenue / maxRevenue) * 100}%` }}
                  />
                </div>
                <span className="font-body text-[11px] text-warm-gray shrink-0 w-16 text-right">
                  {formatPrice(p.revenue)}
                </span>
              </div>
            </div>
            <span className="font-body text-[11px] text-warm-gray shrink-0">
              {p.units_sold} u.
            </span>
          </div>
          )
        })}
      </div>
    </div>
  )
}
