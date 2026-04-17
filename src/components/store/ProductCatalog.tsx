'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import type { Product, Category } from '@/types'
import ProductCard from './ProductCard'
import ProductFilters, { type FilterState } from './ProductFilters'
import Select from '@/components/ui/Select'
import Skeleton from '@/components/ui/Skeleton'
import Button from '@/components/ui/Button'

const ITEMS_PER_PAGE = 12

const SORT_OPTIONS = [
  { label: 'Más recientes', value: 'latest' },
  { label: 'Precio: menor a mayor', value: 'price_asc' },
  { label: 'Precio: mayor a menor', value: 'price_desc' },
  { label: 'Nombre A–Z', value: 'name_asc' },
]

interface ProductCatalogProps {
  initialProducts: Product[]
  categories: (Category & { product_count?: number })[]
}

export default function ProductCatalog({
  initialProducts,
  categories,
}: ProductCatalogProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get('category')

  const [filters, setFilters] = useState<FilterState>({
    categories: categoryParam ? [categoryParam] : [],
    sizes: [],
    colors: [],
    priceMin: 0,
    priceMax: 5000,
    inStockOnly: false,
  })

  const [sortBy, setSortBy] = useState('latest')
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const availableSizes = useMemo(() => {
    const s = new Set<string>()
    initialProducts.forEach((p) => p.variants?.forEach((v) => s.add(v.size)))
    return Array.from(s).sort()
  }, [initialProducts])

  const availableColors = useMemo(() => {
    const map = new Map<string, { label: string; hex: string }>()
    initialProducts.forEach((p) =>
      p.variants?.forEach((v) => {
        if (!map.has(v.color)) map.set(v.color, { label: v.color, hex: v.color_hex })
      })
    )
    return Array.from(map.entries()).map(([value, info]) => ({
      value, label: info.label, hex: info.hex,
    }))
  }, [initialProducts])

  const priceRange = useMemo(() => {
    const prices = initialProducts.map((p) => p.price)
    return { min: Math.min(...prices, 0), max: Math.max(...prices, 5000) }
  }, [initialProducts])

  const categoryOptions = useMemo(
    () => categories.map((c) => ({ label: c.name, value: c.slug, count: c.product_count })),
    [categories]
  )

  // Client-side filtering
  const filtered = useMemo(() => {
    let result = [...initialProducts]

    if (filters.categories.length > 0) {
      const catIds = categories
        .filter((c) => filters.categories.includes(c.slug))
        .map((c) => c.id)
      result = result.filter((p) => catIds.includes(p.category_id))
    }
    if (filters.sizes.length > 0) {
      result = result.filter((p) => p.variants?.some((v) => filters.sizes.includes(v.size)))
    }
    if (filters.colors.length > 0) {
      result = result.filter((p) => p.variants?.some((v) => filters.colors.includes(v.color)))
    }
    result = result.filter((p) => p.price >= filters.priceMin && p.price <= filters.priceMax)
    if (filters.inStockOnly) {
      result = result.filter((p) => p.variants?.some((v) => v.stock > 0))
    }

    switch (sortBy) {
      case 'price_asc': result.sort((a, b) => a.price - b.price); break
      case 'price_desc': result.sort((a, b) => b.price - a.price); break
      case 'name_asc': result.sort((a, b) => a.name.localeCompare(b.name)); break
      default: result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }
    return result
  }, [initialProducts, filters, sortBy, categories])

  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  const hasActiveFilters =
    filters.categories.length > 0 || filters.sizes.length > 0 ||
    filters.colors.length > 0 || filters.inStockOnly ||
    filters.priceMin > priceRange.min || filters.priceMax < priceRange.max

  const handleFilterChange = useCallback((next: FilterState) => {
    setIsTransitioning(true)
    setVisibleCount(ITEMS_PER_PAGE)
    setTimeout(() => { setFilters(next); setIsTransitioning(false) }, 200)
  }, [])

  const clearFilters = useCallback(() => {
    setIsTransitioning(true)
    setVisibleCount(ITEMS_PER_PAGE)
    setTimeout(() => {
      setFilters({ categories: [], sizes: [], colors: [], priceMin: priceRange.min, priceMax: priceRange.max, inStockOnly: false })
      setIsTransitioning(false)
      router.push('/products', { scroll: false })
    }, 200)
  }, [priceRange, router])

  const activeCategory =
    filters.categories.length === 1
      ? categories.find((c) => c.slug === filters.categories[0])?.name
      : null

  const filterProps = {
    categories: categoryOptions,
    sizes: availableSizes,
    colors: availableColors,
    priceRange,
    filters,
    onFilterChange: handleFilterChange,
    onClear: clearFilters,
    hasActiveFilters,
  }

  return (
    <div className="max-w-[1600px] mx-auto px-6 md:px-16 lg:px-20 py-8 md:py-12">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <ol className="flex items-center gap-2 font-body text-[11px] text-warm-gray">
          <li><Link href="/" className="hover:text-charcoal transition-colors">Inicio</Link></li>
          <li>/</li>
          <li className="text-charcoal">Tienda</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 md:mb-14">
        <div>
          <h1 className="font-display text-[32px] md:text-[36px] text-charcoal">
            {activeCategory || 'Todas las piezas'}
          </h1>
          <p className="font-body text-[13px] text-warm-gray mt-1">
            ({filtered.length} {filtered.length === 1 ? 'pieza' : 'piezas'})
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Mobile filter trigger (hidden on desktop) */}
          <div className="lg:hidden">
            <ProductFilters {...filterProps} />
          </div>
          <div className="w-[180px]">
            <Select options={SORT_OPTIONS} value={sortBy} onChange={setSortBy} placeholder="Ordenar por" />
          </div>
        </div>
      </div>

      {/* Main: sidebar + grid */}
      <div className="flex">
        {/* Desktop sidebar (hidden on mobile) */}
        <div className="hidden lg:block">
          <ProductFilters {...filterProps} />
        </div>

        {/* Grid */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {isTransitioning ? (
              <motion.div key="sk" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 lg:gap-x-8 gap-y-10 lg:gap-y-12"
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i}>
                    <Skeleton variant="image" />
                    <div className="mt-3 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-1/3" /></div>
                  </div>
                ))}
              </motion.div>
            ) : filtered.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-24 text-center"
              >
                <p className="font-display italic text-[22px] md:text-[24px] text-charcoal mb-6">
                  Ninguna pieza coincide con tu selección
                </p>
                <Button variant="secondary" onClick={clearFilters}>Limpiar filtros</Button>
              </motion.div>
            ) : (
              <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
                className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 lg:gap-x-8 gap-y-10 lg:gap-y-12"
              >
                {visible.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {hasMore && !isTransitioning && (
            <div className="flex justify-center mt-14">
              <Button variant="secondary" onClick={() => setVisibleCount((c) => c + ITEMS_PER_PAGE)}>
                Cargar más
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
