'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, MoreHorizontal, Trash2, Copy, Archive, Pencil, X } from 'lucide-react'
import type { Product, Category } from '@/types'
import { formatPrice, cn } from '@/lib/utils'
import { getPrimaryProductImageUrl } from '@/lib/editorial-images'
import { PRODUCT_STATUSES } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'

interface Props {
  initialProducts: Product[]
  categories: Category[]
}

export default function AdminProductsList({ initialProducts, categories }: Props) {
  const router = useRouter()
  const [products, setProducts] = useState(initialProducts)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [deleteModal, setDeleteModal] = useState<Product | null>(null)
  const [actionMenu, setActionMenu] = useState<string | null>(null)

  const categoryOptions = [
    { label: 'Todas las categorías', value: '' },
    ...categories.map((c) => ({ label: c.name, value: c.id })),
  ]

  const statusOptions = [
    { label: 'Todos los estados', value: '' },
    { label: 'Activo', value: 'active' },
    { label: 'Borrador', value: 'draft' },
    { label: 'Archivado', value: 'archived' },
  ]

  const filtered = useMemo(() => {
    let result = [...products]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.variants?.some((v) => v.sku.toLowerCase().includes(q))
      )
    }
    if (catFilter) result = result.filter((p) => p.category_id === catFilter)
    if (statusFilter) result = result.filter((p) => p.status === statusFilter)
    return result
  }, [products, search, catFilter, statusFilter])

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (selected.size === filtered.length) setSelected(new Set())
    else setSelected(new Set(filtered.map((p) => p.id)))
  }

  function totalStock(p: Product) {
    return p.variants?.reduce((s, v) => s + v.stock, 0) || 0
  }

  function getCategoryName(id: string) {
    return categories.find((c) => c.id === id)?.name || '—'
  }

  const statusVariant: Record<string, 'success' | 'default' | 'sale'> = {
    active: 'success', draft: 'default', archived: 'sale',
  }

  async function handleDelete(product: Product) {
    const supabase = createClient()
    await supabase.from('products').delete().eq('id', product.id)
    setProducts((prev) => prev.filter((p) => p.id !== product.id))
    setDeleteModal(null)
  }

  async function handleBulkDelete() {
    const supabase = createClient()
    const ids = Array.from(selected)
    await supabase.from('products').delete().in('id', ids)
    setProducts((prev) => prev.filter((p) => !selected.has(p.id)))
    setSelected(new Set())
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <input
            type="text"
            placeholder="Buscar productos o SKU…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-pale-gray px-4 py-2 font-body text-[13px] text-charcoal bg-white w-[240px] rounded focus:outline-none focus:border-charcoal transition-colors"
          />
          <div className="w-[160px]">
            <Select options={categoryOptions} value={catFilter} onChange={setCatFilter} placeholder="Categoría" />
          </div>
          <div className="w-[140px]">
            <Select options={statusOptions} value={statusFilter} onChange={setStatusFilter} placeholder="Estado" />
          </div>
        </div>
        <Link href="/admin/products/new">
          <Button size="sm"><Plus className="h-4 w-4 mr-1.5" strokeWidth={1.5} />Nuevo producto</Button>
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white border border-pale-gray rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-pale-gray">
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0}
                    onChange={toggleAll} className="accent-charcoal" />
                </th>
                <th className="px-4 py-3 w-16" />
                {['Nombre', 'Categoría', 'Precio', 'Stock', 'Estado', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-body text-[11px] uppercase tracking-[0.08em] text-warm-gray font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => {
                const stock = totalStock(product)
                return (
                  <tr key={product.id} className="border-b border-pale-gray last:border-0 hover:bg-ivory transition-colors">
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.has(product.id)}
                        onChange={() => toggleSelect(product.id)} className="accent-charcoal" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative h-[50px] w-[40px] bg-cream rounded overflow-hidden">
                        <Image
                          src={getPrimaryProductImageUrl(product)}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/products/${product.id}`}
                        className="font-body text-[13px] text-charcoal hover:underline">{product.name}</Link>
                      <p className="font-body text-[11px] text-warm-gray mt-0.5">
                        {product.variants?.[0]?.sku || product.slug}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-body text-[13px] text-dark-gray">{getCategoryName(product.category_id)}</td>
                    <td className="px-4 py-3 font-body text-[13px] text-charcoal">{formatPrice(product.price)}</td>
                    <td className="px-4 py-3">
                      <span className={cn('font-body text-[13px]', stock === 0 ? 'text-muted-red' : 'text-dark-gray')}>
                        {stock === 0 ? 'Sin stock' : stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant[product.status] || 'default'}>
                        {(PRODUCT_STATUSES as Record<string, { label: string }>)[product.status]?.label ?? product.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 relative">
                      <button onClick={() => setActionMenu(actionMenu === product.id ? null : product.id)}
                        className="text-warm-gray hover:text-charcoal">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {actionMenu === product.id && (
                        <div className="absolute right-4 top-12 z-20 bg-white border border-pale-gray py-1 w-[140px] shadow-sm">
                          <Link href={`/admin/products/${product.id}`}
                            className="flex items-center gap-2 px-3 py-2 font-body text-[12px] text-dark-gray hover:bg-ivory w-full">
                            <Pencil className="h-3.5 w-3.5" /> Editar
                          </Link>
                          <button onClick={() => { setDeleteModal(product); setActionMenu(null) }}
                            className="flex items-center gap-2 px-3 py-2 font-body text-[12px] text-muted-red hover:bg-ivory w-full">
                            <Trash2 className="h-3.5 w-3.5" /> Eliminar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-charcoal text-white px-8 py-4 flex items-center justify-between">
          <span className="font-body text-[13px]">{selected.size} {selected.size > 1 ? 'seleccionados' : 'seleccionado'}</span>
          <div className="flex items-center gap-3">
            <button onClick={handleBulkDelete}
              className="flex items-center gap-1.5 font-body text-[12px] uppercase tracking-[0.08em] text-white/80 hover:text-white">
              <Trash2 className="h-4 w-4" /> Eliminar
            </button>
            <button onClick={() => setSelected(new Set())} className="text-white/50 hover:text-white ml-4">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Delete modal */}
      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Eliminar producto" size="sm">
        <p className="font-body text-[14px] text-dark-gray mb-6">
          ¿Eliminar <strong>{deleteModal?.name}</strong>? Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setDeleteModal(null)}>Cancelar</Button>
          <Button variant="danger" onClick={() => deleteModal && handleDelete(deleteModal)}>Eliminar</Button>
        </div>
      </Modal>
    </div>
  )
}
