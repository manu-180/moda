'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { Search, AlertTriangle, Check, X, ChevronDown, ChevronRight } from 'lucide-react'
import type { Product, Category, ProductVariant } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { getPrimaryProductImageUrl } from '@/lib/editorial-images'
import Badge from '@/components/ui/Badge'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import StatsCard from './StatsCard'

interface Props {
  products: Product[]
  categories: Category[]
}

type StockStatus = 'all' | 'in_stock' | 'low' | 'out'

function getStatus(stock: number): { label: string; variant: 'success' | 'warning' | 'sale' } {
  if (stock > 10) return { label: 'En stock', variant: 'success' }
  if (stock > 0) return { label: 'Stock bajo', variant: 'warning' }
  return { label: 'Sin stock', variant: 'sale' }
}

export default function AdminInventory({ products, categories }: Props) {
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [stockFilter, setStockFilter] = useState<StockStatus>('all')
  const [grouped, setGrouped] = useState(false)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState(0)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkValue, setBulkValue] = useState(0)
  const [variantStocks, setVariantStocks] = useState<Map<string, number>>(() => {
    const m = new Map<string, number>()
    products.forEach((p) => p.variants?.forEach((v) => m.set(v.id, v.stock)))
    return m
  })

  // Flatten all variants with product info
  const allVariants = useMemo(() => {
    const result: { product: Product; variant: ProductVariant }[] = []
    products.forEach((p) => p.variants?.forEach((v) => result.push({ product: p, variant: v })))
    return result
  }, [products])

  // Stats
  const stats = useMemo(() => {
    const total = allVariants.length
    let inStock = 0, low = 0, out = 0
    allVariants.forEach(({ variant }) => {
      const s = variantStocks.get(variant.id) ?? variant.stock
      if (s > 10) inStock++
      else if (s > 0) low++
      else out++
    })
    return { total, inStock, low, out }
  }, [allVariants, variantStocks])

  // Filter
  const filtered = useMemo(() => {
    let result = [...allVariants]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(({ product, variant }) =>
        product.name.toLowerCase().includes(q) || variant.sku.toLowerCase().includes(q)
      )
    }
    if (catFilter) result = result.filter(({ product }) => product.category_id === catFilter)
    if (stockFilter !== 'all') {
      result = result.filter(({ variant }) => {
        const s = variantStocks.get(variant.id) ?? variant.stock
        if (stockFilter === 'in_stock') return s > 10
        if (stockFilter === 'low') return s > 0 && s <= 10
        return s === 0
      })
    }
    // Sort: out of stock first
    result.sort((a, b) => (variantStocks.get(a.variant.id) ?? a.variant.stock) - (variantStocks.get(b.variant.id) ?? b.variant.stock))
    return result
  }, [allVariants, search, catFilter, stockFilter, variantStocks])

  // Grouped view data
  const groupedProducts = useMemo(() => {
    const map = new Map<string, { product: Product; variants: ProductVariant[] }>()
    filtered.forEach(({ product, variant }) => {
      const existing = map.get(product.id)
      if (existing) existing.variants.push(variant)
      else map.set(product.id, { product, variants: [variant] })
    })
    return Array.from(map.values())
  }, [filtered])

  const categoryOptions = [
    { label: 'Todas las categorías', value: '' },
    ...categories.map((c) => ({ label: c.name, value: c.id })),
  ]
  const stockOptions = [
    { label: 'Todo el stock', value: 'all' },
    { label: 'En stock', value: 'in_stock' },
    { label: 'Stock bajo', value: 'low' },
    { label: 'Sin stock', value: 'out' },
  ]

  async function saveStock(variantId: string, newStock: number) {
    const supabase = createClient()
    await supabase.from('product_variants').update({ stock: newStock }).eq('id', variantId)
    setVariantStocks((prev) => new Map(prev).set(variantId, newStock))
    setEditingId(null)
  }

  async function applyBulk() {
    const supabase = createClient()
    const ids = Array.from(selected)
    await supabase.from('product_variants').update({ stock: bulkValue }).in('id', ids)
    setVariantStocks((prev) => {
      const next = new Map(prev)
      ids.forEach((id) => next.set(id, bulkValue))
      return next
    })
    setSelected(new Set())
  }

  function renderVariantRow(product: Product, variant: ProductVariant, indent = false) {
    const stock = variantStocks.get(variant.id) ?? variant.stock
    const status = getStatus(stock)
    const isEditing = editingId === variant.id

    return (
      <tr key={variant.id} className={cn(
        'border-b border-pale-gray last:border-0 hover:bg-ivory transition-colors',
        indent && 'bg-ivory/50'
      )}>
        <td className="px-4 py-3 w-10">
          <input type="checkbox" checked={selected.has(variant.id)}
            onChange={() => {
              setSelected((prev) => {
                const next = new Set(prev)
                next.has(variant.id) ? next.delete(variant.id) : next.add(variant.id)
                return next
              })
            }} className="accent-charcoal" />
        </td>
        {!indent && (
          <td className="px-4 py-3 w-12">
            <div className="h-10 w-8 bg-cream rounded overflow-hidden relative">
              <Image src={getPrimaryProductImageUrl(product)} alt="" fill className="object-cover" sizes="32px" />
            </div>
          </td>
        )}
        {indent && <td />}
        <td className="px-4 py-3 font-body text-[13px] text-charcoal">{indent ? '' : product.name}</td>
        <td className="px-4 py-3 font-body text-[11px] text-warm-gray font-mono">{variant.sku}</td>
        <td className="px-4 py-3 font-body text-[13px] text-dark-gray">{variant.size}</td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-full border border-pale-gray shrink-0"
              style={{ backgroundColor: variant.color_hex }} />
            <span className="font-body text-[12px] text-dark-gray">{variant.color}</span>
          </div>
        </td>
        <td className="px-4 py-3">
          {isEditing ? (
            <div className="flex items-center gap-1">
              <input type="number" min="0" value={editValue}
                onChange={(e) => setEditValue(parseInt(e.target.value) || 0)}
                className="w-16 border border-charcoal px-2 py-1 font-body text-[13px] rounded focus:outline-none" autoFocus />
              <button onClick={() => saveStock(variant.id, editValue)}
                className="text-deep-forest hover:text-charcoal p-0.5"><Check className="h-4 w-4" /></button>
              <button onClick={() => setEditingId(null)}
                className="text-warm-gray hover:text-muted-red p-0.5"><X className="h-4 w-4" /></button>
            </div>
          ) : (
            <span className={cn('font-body text-[13px] font-medium', stock === 0 && 'text-muted-red')}>
              {stock}
            </span>
          )}
        </td>
        <td className="px-4 py-3"><Badge variant={status.variant}>{status.label}</Badge></td>
        <td className="px-4 py-3">
          {!isEditing && (
            <button onClick={() => { setEditingId(variant.id); setEditValue(stock) }}
              className="font-body text-[11px] uppercase tracking-[0.08em] text-warm-gray hover:text-charcoal transition-colors">
              Actualizar
            </button>
          )}
        </td>
      </tr>
    )
  }

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard label="SKUs totales" value={String(stats.total)} icon="Layers" accentColor="#1A1A1A" index={0} />
        <StatsCard label="En stock" value={String(stats.inStock)} icon="Package" accentColor="#2D5016" index={1} />
        <StatsCard label="Stock bajo" value={String(stats.low)} icon="AlertCircle" accentColor="#C4A265" index={2} />
        <StatsCard label="Sin stock" value={String(stats.out)} icon="PackageX" accentColor="#9B1B30" index={3} />
      </div>

      {/* Low stock alert */}
      {stats.low > 0 && (
        <div className="bg-champagne/10 border border-champagne/30 rounded-lg px-5 py-3 mb-6 flex items-center gap-3">
          <AlertTriangle className="h-4 w-4 text-champagne shrink-0" />
          <p className="font-body text-[13px] text-dark-gray">
            <strong>{stats.low}</strong> productos con stock bajo.
            <button onClick={() => setStockFilter('low')}
              className="ml-1 text-charcoal underline underline-offset-2">Ver</button>
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center border border-pale-gray px-3 py-2 gap-2 bg-white rounded flex-1 max-w-[280px]">
          <Search className="h-4 w-4 text-warm-gray" strokeWidth={1.5} />
          <input type="text" placeholder="Buscar producto o SKU…"
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="font-body text-[13px] text-charcoal bg-transparent border-none outline-none w-full placeholder:text-warm-gray" />
        </div>
        <div className="w-[160px]"><Select options={categoryOptions} value={catFilter} onChange={setCatFilter} /></div>
        <div className="w-[140px]"><Select options={stockOptions} value={stockFilter} onChange={(v) => setStockFilter(v as StockStatus)} /></div>
        <button onClick={() => setGrouped(!grouped)}
          className={cn(
            'px-4 py-2 font-body text-[12px] uppercase tracking-[0.08em] border rounded transition-colors',
            grouped ? 'bg-charcoal text-white border-charcoal' : 'bg-white text-dark-gray border-pale-gray hover:border-charcoal'
          )}>
          Agrupado
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-pale-gray rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-pale-gray">
                <th className="px-4 py-3 w-10"><input type="checkbox" className="accent-charcoal"
                  onChange={() => {
                    if (selected.size === filtered.length) setSelected(new Set())
                    else setSelected(new Set(filtered.map(({ variant }) => variant.id)))
                  }} /></th>
                {['', 'Producto', 'SKU', 'Talle', 'Color', 'Stock', 'Estado', ''].map((h, i) => (
                  <th key={i} className="px-4 py-3 text-left font-body text-[11px] uppercase tracking-[0.08em] text-warm-gray font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grouped ? (
                groupedProducts.map(({ product, variants }) => (
                  <GroupedRow key={product.id} product={product} variants={variants}
                    expanded={expanded.has(product.id)}
                    onToggle={() => setExpanded((prev) => {
                      const next = new Set(prev)
                      next.has(product.id) ? next.delete(product.id) : next.add(product.id)
                      return next
                    })}
                    renderVariant={(v) => renderVariantRow(product, v, true)}
                    variantStocks={variantStocks}
                  />
                ))
              ) : (
                filtered.map(({ product, variant }) => renderVariantRow(product, variant))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk bar */}
      {selected.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-charcoal text-white px-8 py-4 flex items-center justify-between">
          <span className="font-body text-[13px]">{selected.size} variante{selected.size > 1 ? 's' : ''} seleccionada{selected.size > 1 ? 's' : ''}</span>
          <div className="flex items-center gap-3">
            <span className="font-body text-[12px] text-white/60">Fijar stock en:</span>
            <input type="number" min="0" value={bulkValue}
              onChange={(e) => setBulkValue(parseInt(e.target.value) || 0)}
              className="w-16 bg-white/10 border border-white/30 px-2 py-1 text-white font-body text-[13px] rounded focus:outline-none" />
            <Button size="sm" onClick={applyBulk}>Aplicar</Button>
            <button onClick={() => setSelected(new Set())} className="text-white/50 hover:text-white ml-2">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Grouped row
function GroupedRow({
  product, variants, expanded, onToggle, renderVariant, variantStocks,
}: {
  product: Product; variants: ProductVariant[]; expanded: boolean
  onToggle: () => void; renderVariant: (v: ProductVariant) => React.ReactNode
  variantStocks: Map<string, number>
}) {
  const totalStock = variants.reduce((s, v) => s + (variantStocks.get(v.id) ?? v.stock), 0)
  return (
    <>
      <tr className="border-b border-pale-gray hover:bg-ivory transition-colors cursor-pointer" onClick={onToggle}>
        <td className="px-4 py-3" />
        <td className="px-4 py-3">
          <div className="h-10 w-8 bg-cream rounded overflow-hidden relative">
            <Image src={getPrimaryProductImageUrl(product)} alt="" fill className="object-cover" sizes="32px" />
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            {expanded ? <ChevronDown className="h-3.5 w-3.5 text-warm-gray" /> : <ChevronRight className="h-3.5 w-3.5 text-warm-gray" />}
            <span className="font-body text-[13px] text-charcoal font-medium">{product.name}</span>
          </div>
        </td>
        <td className="px-4 py-3 font-body text-[11px] text-warm-gray">{variants.length} variantes</td>
        <td /><td />
        <td className="px-4 py-3 font-body text-[13px] text-charcoal font-medium">{totalStock}</td>
        <td /><td />
      </tr>
      {expanded && variants.map(renderVariant)}
    </>
  )
}
