'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Toggle from '@/components/ui/Toggle'

const ease = [0.25, 0.1, 0.25, 1] as const

export interface FilterState {
  categories: string[]
  sizes: string[]
  colors: string[]
  priceMin: number
  priceMax: number
  inStockOnly: boolean
}

interface FilterOption {
  label: string
  value: string
  count?: number
  hex?: string
}

interface ProductFiltersProps {
  categories: FilterOption[]
  sizes: string[]
  colors: FilterOption[]
  priceRange: { min: number; max: number }
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
  onClear: () => void
  hasActiveFilters: boolean
}

// Reusable checkbox
function Checkbox({
  checked,
  onChange,
  label,
  count,
}: {
  checked: boolean
  onChange: () => void
  label: string
  count?: number
}) {
  return (
    <button
      onClick={onChange}
      className="flex items-center justify-between w-full py-1.5 group"
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'h-4 w-4 border flex items-center justify-center transition-all duration-200',
            checked ? 'border-charcoal bg-charcoal' : 'border-pale-gray group-hover:border-warm-gray'
          )}
        >
          {checked && (
            <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
        <span className="font-body text-[13px] text-dark-gray">{label}</span>
      </div>
      {count !== undefined && (
        <span className="font-body text-[11px] text-warm-gray">{count}</span>
      )}
    </button>
  )
}

// Desktop sidebar content
function FilterContent({
  categories,
  sizes,
  colors,
  priceRange,
  filters,
  onFilterChange,
  onClear,
  hasActiveFilters,
}: ProductFiltersProps) {
  function toggleCategory(slug: string) {
    const next = filters.categories.includes(slug)
      ? filters.categories.filter((c) => c !== slug)
      : [...filters.categories, slug]
    onFilterChange({ ...filters, categories: next })
  }

  function toggleSize(size: string) {
    const next = filters.sizes.includes(size)
      ? filters.sizes.filter((s) => s !== size)
      : [...filters.sizes, size]
    onFilterChange({ ...filters, sizes: next })
  }

  function toggleColor(color: string) {
    const next = filters.colors.includes(color)
      ? filters.colors.filter((c) => c !== color)
      : [...filters.colors, color]
    onFilterChange({ ...filters, colors: next })
  }

  return (
    <div className="flex flex-col gap-8">
      {hasActiveFilters && (
        <button
          onClick={onClear}
          className="self-start font-body text-[11px] uppercase tracking-[0.1em] text-warm-gray hover:text-charcoal transition-colors duration-200 underline underline-offset-2"
        >
          Borrar todo
        </button>
      )}

      {/* Categories */}
      <div>
        <h3 className="font-body text-[11px] uppercase tracking-[0.12em] text-warm-gray mb-4">
          Categoría
        </h3>
        <div className="flex flex-col gap-0.5">
          {categories.map((cat) => (
            <Checkbox
              key={cat.value}
              checked={filters.categories.includes(cat.value)}
              onChange={() => toggleCategory(cat.value)}
              label={cat.label}
              count={cat.count}
            />
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div>
        <h3 className="font-body text-[11px] uppercase tracking-[0.12em] text-warm-gray mb-4">
          Talle
        </h3>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={cn(
                'min-w-[40px] py-2 px-3 font-body text-[12px] border transition-all duration-200',
                filters.sizes.includes(size)
                  ? 'border-charcoal bg-charcoal text-white'
                  : 'border-pale-gray text-dark-gray hover:border-charcoal'
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div>
        <h3 className="font-body text-[11px] uppercase tracking-[0.12em] text-warm-gray mb-4">
          Color
        </h3>
        <div className="flex flex-wrap gap-3">
          {colors.map((color) => (
            <button
              key={color.value}
              onClick={() => toggleColor(color.value)}
              title={color.label}
              className={cn(
                'h-7 w-7 rounded-full border-2 transition-all duration-200',
                filters.colors.includes(color.value)
                  ? 'border-charcoal scale-110'
                  : 'border-transparent hover:border-warm-gray'
              )}
            >
              <span
                className="block h-full w-full rounded-full border border-pale-gray"
                style={{ backgroundColor: color.hex }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-body text-[11px] uppercase tracking-[0.12em] text-warm-gray mb-2">
          Precio
        </h3>
        <p className="font-body text-[12px] text-dark-gray mb-3">
          {formatPrice(filters.priceMin)} — {formatPrice(filters.priceMax)}
        </p>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <span
              className="shrink-0 w-6 font-body text-[10px] tracking-[0.06em] text-warm-gray/75"
              aria-hidden
            >
              min
            </span>
            <input
              type="range"
              min={priceRange.min}
              max={priceRange.max}
              value={filters.priceMin}
              onChange={(e) =>
                onFilterChange({ ...filters, priceMin: Number(e.target.value) })
              }
              aria-label="Precio mínimo del rango"
              className="min-w-0 flex-1 accent-charcoal"
            />
          </div>
          <div className="flex items-center gap-2.5">
            <span
              className="shrink-0 w-6 font-body text-[10px] tracking-[0.06em] text-warm-gray/75"
              aria-hidden
            >
              max
            </span>
            <input
              type="range"
              min={priceRange.min}
              max={priceRange.max}
              value={filters.priceMax}
              onChange={(e) =>
                onFilterChange({ ...filters, priceMax: Number(e.target.value) })
              }
              aria-label="Precio máximo del rango"
              className="min-w-0 flex-1 accent-charcoal"
            />
          </div>
        </div>
      </div>

      {/* In Stock */}
      <div>
        <Toggle
          checked={filters.inStockOnly}
          onChange={(checked) =>
            onFilterChange({ ...filters, inStockOnly: checked })
          }
          label="Solo en stock"
        />
      </div>
    </div>
  )
}

// Main export — handles desktop sidebar + mobile bottom sheet
export default function ProductFilters(props: ProductFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-[280px] shrink-0 pr-12">
        <FilterContent {...props} />
      </aside>

      {/* Mobile trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden flex items-center gap-2 font-body text-[12px] uppercase tracking-[0.1em] text-charcoal border border-pale-gray px-4 py-2.5"
      >
        <SlidersHorizontal className="h-4 w-4" strokeWidth={1.5} />
        Filtros
      </button>

      {/* Mobile bottom sheet */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70] bg-black/40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.4, ease }}
              className="fixed bottom-0 left-0 right-0 z-[80] bg-white max-h-[85vh] overflow-y-auto px-6 pb-8 pt-4"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="font-body text-[12px] uppercase tracking-[0.12em] text-charcoal font-medium">
                  Filtros
                </span>
                <button onClick={() => setMobileOpen(false)}>
                  <X className="h-5 w-5 text-warm-gray" strokeWidth={1.5} />
                </button>
              </div>
              <FilterContent {...props} />
              <div className="mt-8">
                <Button fullWidth onClick={() => setMobileOpen(false)}>
                  Ver resultados
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
