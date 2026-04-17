'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import useEmblaCarousel from 'embla-carousel-react'
import type { ProductImage } from '@/types'
import { cn } from '@/lib/utils'

interface ProductGalleryProps {
  images: ProductImage[]
}

export default function ProductGallery({ images }: ProductGalleryProps) {
  const sorted = [...images].sort((a, b) => a.position - b.position)
  const [activeIndex, setActiveIndex] = useState(0)
  const imageRefs = useRef<Map<number, HTMLDivElement>>(new Map())

  // Zoom state per image
  const [zoomIndex, setZoomIndex] = useState<number | null>(null)
  const [origin, setOrigin] = useState({ x: 50, y: 50 })

  // Intersection observer for active thumbnail
  useEffect(() => {
    const observers: IntersectionObserver[] = []
    imageRefs.current.forEach((el, idx) => {
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveIndex(idx) },
        { threshold: 0.6 }
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach((o) => o.disconnect())
  }, [sorted.length])

  function scrollToImage(idx: number) {
    const el = imageRefs.current.get(idx)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>, idx: number) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setOrigin({ x, y })
    setZoomIndex(idx)
  }

  // Mobile carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false })
  const [mobileActive, setMobileActive] = useState(0)

  const onMobileSelect = useCallback(() => {
    if (!emblaApi) return
    setMobileActive(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', onMobileSelect)
    return () => { emblaApi.off('select', onMobileSelect) }
  }, [emblaApi, onMobileSelect])

  if (sorted.length === 0) {
    return <div className="aspect-[3/4] bg-cream" />
  }

  return (
    <>
      {/* Desktop gallery */}
      <div className="hidden lg:flex gap-4">
        {/* Thumbnails */}
        <div className="flex flex-col gap-2 shrink-0 pt-1">
          {sorted.map((img, i) => (
            <button
              key={img.id}
              onClick={() => scrollToImage(i)}
              className={cn(
                'w-[60px] h-[80px] relative overflow-hidden border transition-all duration-200',
                activeIndex === i ? 'border-charcoal' : 'border-transparent hover:border-pale-gray'
              )}
            >
              <Image src={img.url} alt={img.alt || ''} fill className="object-cover" sizes="60px" />
            </button>
          ))}
        </div>

        {/* Main images stacked */}
        <div className="flex-1 flex flex-col gap-4">
          {sorted.map((img, i) => (
            <div
              key={img.id}
              ref={(el) => { if (el) imageRefs.current.set(i, el) }}
              className="relative aspect-[3/4] overflow-hidden cursor-crosshair bg-cream"
              onMouseMove={(e) => handleMouseMove(e, i)}
              onMouseLeave={() => setZoomIndex(null)}
            >
              <Image
                src={img.url}
                alt={img.alt || ''}
                fill
                className={cn(
                  'object-cover transition-transform duration-500 ease-luxury',
                  zoomIndex === i && 'scale-[2]'
                )}
                style={zoomIndex === i ? { transformOrigin: `${origin.x}% ${origin.y}%` } : undefined}
                sizes="(max-width: 1024px) 100vw, 60vw"
                priority={i === 0}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile carousel */}
      <div className="lg:hidden">
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex">
            {sorted.map((img) => (
              <div key={img.id} className="relative aspect-[3/4] flex-[0_0_100%] min-w-0 bg-cream">
                <Image src={img.url} alt={img.alt || ''} fill className="object-cover" sizes="100vw" priority />
              </div>
            ))}
          </div>
        </div>
        {/* Dots */}
        {sorted.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            {sorted.map((_, i) => (
              <button
                key={i}
                onClick={() => emblaApi?.scrollTo(i)}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  mobileActive === i ? 'w-5 bg-charcoal' : 'w-1.5 bg-pale-gray'
                )}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
