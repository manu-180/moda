'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/types'
import ProductCard from './ProductCard'

const ease = [0.25, 0.1, 0.25, 1] as const

const POPULAR = [
  { label: 'Vestidos', href: '/products?category=dresses' },
  { label: 'Abrigos', href: '/products?category=outerwear' },
  { label: 'Novedades', href: '/collections/new-arrivals' },
  { label: 'Ofertas', href: '/products?sale=true' },
]

interface SearchOverlayProps {
  isOpen: boolean
  onClose: () => void
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [searched, setSearched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const latestQueryRef = useRef('')

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      document.body.style.overflow = ''
      setQuery('')
      setResults([])
      setSearched(false)
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); setSearched(false); return }
    latestQueryRef.current = q
    const supabase = createClient()
    const { data } = await supabase
      .from('products')
      .select('*, images:product_images(*), variants:product_variants(*)')
      .eq('status', 'active')
      .ilike('name', `%${q}%`)
      .limit(12)
    if (latestQueryRef.current !== q) return
    setResults((data as Product[]) || [])
    setSearched(true)
  }, [])

  function handleChange(value: string) {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(value), 300)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[90] bg-white overflow-y-auto"
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 md:right-10 text-warm-gray hover:text-charcoal transition-colors z-10"
            aria-label="Cerrar búsqueda"
          >
            <X className="h-6 w-6" strokeWidth={1.5} />
          </button>

          <div className="max-w-[1200px] mx-auto px-6 md:px-16 pt-24 pb-16">
            {/* Search input */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5, ease }}
              className="border-b border-charcoal pb-4 mb-12"
            >
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="Buscar piezas…"
                className="w-full bg-transparent font-display text-[24px] md:text-[36px] text-charcoal placeholder:text-pale-gray focus:outline-none"
              />
            </motion.div>

            {/* Results or suggestions */}
            {searched && results.length === 0 ? (
              <div className="text-center py-16">
                <p className="font-display italic text-[20px] text-charcoal mb-2">
                  Sin resultados para &ldquo;{query}&rdquo;
                </p>
                <p className="font-body text-[14px] text-warm-gray">
                  Probá con otra búsqueda
                </p>
              </div>
            ) : results.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
                {results.map((product, i) => (
                  <div key={product.id} onClick={onClose}>
                    <ProductCard product={product} index={i} />
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <p className="font-body text-[11px] uppercase tracking-[0.15em] text-warm-gray mb-5">
                  Búsquedas populares
                </p>
                <div className="flex flex-wrap gap-3">
                  {POPULAR.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={onClose}
                      className="px-5 py-2.5 border border-pale-gray font-body text-[13px] text-charcoal hover:border-charcoal hover:bg-charcoal hover:text-white transition-all duration-300"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
