'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react'
import type { Category, Collection } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { slugify, cn } from '@/lib/utils'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'
import Toggle from '@/components/ui/Toggle'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Tabs from '@/components/ui/Tabs'

type CatWithCount = Category & { product_count: number }
type ColWithCount = Collection & { product_count: number }

interface Props {
  initialCategories: CatWithCount[]
  initialCollections: ColWithCount[]
}

// ─── CATEGORY FORM ────────────────────────────────────────
function CategoryForm({
  category, categories, onSave, onCancel,
}: {
  category: CatWithCount | null
  categories: CatWithCount[]
  onSave: (data: Partial<Category>) => Promise<void>
  onCancel: () => void
}) {
  const [name, setName] = useState(category?.name || '')
  const [slug, setSlug] = useState(category?.slug || '')
  const [description, setDescription] = useState(category?.description || '')
  const [parentId, setParentId] = useState(category?.parent_id || '')
  const [saving, setSaving] = useState(false)

  const parentOptions = [
    { label: 'Ninguna (nivel superior)', value: '' },
    ...categories.filter((c) => c.id !== category?.id).map((c) => ({ label: c.name, value: c.id })),
  ]

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    await onSave({
      id: category?.id,
      name,
      slug: slug || slugify(name),
      description: description || undefined,
      parent_id: parentId || undefined,
      position: category?.position ?? categories.length,
    })
    setSaving(false)
  }

  return (
    <div className="bg-white border border-pale-gray rounded-lg p-6">
      <h3 className="font-body text-[12px] uppercase tracking-[0.08em] text-warm-gray mb-5">
        {category ? 'Editar categoría' : 'Nueva categoría'}
      </h3>
      <div className="space-y-5">
        <Input label="Nombre" id="cat-name" value={name}
          onChange={(e) => { setName(e.target.value); if (!category) setSlug(slugify(e.target.value)) }} />
        <Input label="Slug" id="cat-slug" value={slug}
          onChange={(e) => setSlug(e.target.value)} />
        <Textarea label="Descripción" id="cat-desc" value={description}
          onChange={(e) => setDescription(e.target.value)} autoResize />
        <Select label="Categoría padre" options={parentOptions} value={parentId}
          onChange={setParentId} />
      </div>
      <div className="flex gap-3 justify-end mt-6">
        <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button loading={saving} onClick={handleSave}>Guardar</Button>
      </div>
    </div>
  )
}

// ─── COLLECTION FORM (MODAL) ──────────────────────────────
function CollectionFormModal({
  collection, isOpen, onClose, onSave,
}: {
  collection: ColWithCount | null
  isOpen: boolean
  onClose: () => void
  onSave: (data: Partial<Collection>) => Promise<void>
}) {
  const [name, setName] = useState(collection?.name || '')
  const [slug, setSlug] = useState(collection?.slug || '')
  const [description, setDescription] = useState(collection?.description || '')
  const [season, setSeason] = useState(collection?.season || '')
  const [isActive, setIsActive] = useState(collection?.is_active ?? true)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    await onSave({
      id: collection?.id,
      name,
      slug: slug || slugify(name),
      description: description || undefined,
      season: season || undefined,
      is_active: isActive,
    })
    setSaving(false)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={collection ? 'Editar colección' : 'Nueva colección'} size="md">
      <div className="space-y-5">
        <Input label="Nombre" id="col-name" value={name}
          onChange={(e) => { setName(e.target.value); if (!collection) setSlug(slugify(e.target.value)) }} />
        <Input label="Slug" id="col-slug" value={slug}
          onChange={(e) => setSlug(e.target.value)} />
        <Textarea label="Descripción" id="col-desc" value={description}
          onChange={(e) => setDescription(e.target.value)} autoResize />
        <Input label="Temporada (ej. FW25)" id="col-season" value={season}
          onChange={(e) => setSeason(e.target.value)} />
        <Toggle checked={isActive} onChange={setIsActive} label="Activa" />
      </div>
      <div className="flex gap-3 justify-end mt-6">
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button loading={saving} onClick={handleSave}>Guardar</Button>
      </div>
    </Modal>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────
export default function AdminCategoriesCollections({ initialCategories, initialCollections }: Props) {
  const [categories, setCategories] = useState(initialCategories)
  const [collections, setCollections] = useState(initialCollections)
  const [editingCat, setEditingCat] = useState<CatWithCount | null | 'new'>(null)
  const [editingCol, setEditingCol] = useState<ColWithCount | null | 'new'>(null)
  const [deleteCat, setDeleteCat] = useState<CatWithCount | null>(null)
  const [deleteCol, setDeleteCol] = useState<ColWithCount | null>(null)

  // ── Category CRUD ──
  async function saveCategory(data: Partial<Category>) {
    const supabase = createClient()
    if (data.id) {
      const { id, ...rest } = data
      await supabase.from('categories').update(rest).eq('id', id)
      setCategories((prev) => prev.map((c) => c.id === id ? { ...c, ...rest } as CatWithCount : c))
    } else {
      const { data: created } = await supabase.from('categories').insert(data).select().single()
      if (created) setCategories((prev) => [...prev, { ...created, product_count: 0 } as CatWithCount])
    }
    setEditingCat(null)
  }

  async function handleDeleteCategory() {
    if (!deleteCat) return
    if (deleteCat.product_count > 0) return // blocked in UI
    const supabase = createClient()
    await supabase.from('categories').delete().eq('id', deleteCat.id)
    setCategories((prev) => prev.filter((c) => c.id !== deleteCat.id))
    setDeleteCat(null)
  }

  // ── Collection CRUD ──
  async function saveCollection(data: Partial<Collection>) {
    const supabase = createClient()
    if (data.id) {
      const { id, ...rest } = data
      await supabase.from('collections').update(rest).eq('id', id)
      setCollections((prev) => prev.map((c) => c.id === id ? { ...c, ...rest } as ColWithCount : c))
    } else {
      const { data: created } = await supabase.from('collections').insert(data).select().single()
      if (created) setCollections((prev) => [...prev, { ...created, product_count: 0 } as ColWithCount])
    }
    setEditingCol(null)
  }

  async function handleDeleteCollection() {
    if (!deleteCol) return
    const supabase = createClient()
    await supabase.from('collections').delete().eq('id', deleteCol.id)
    setCollections((prev) => prev.filter((c) => c.id !== deleteCol.id))
    setDeleteCol(null)
  }

  // Sorted categories: parents first, children indented
  const topLevel = categories.filter((c) => !c.parent_id).sort((a, b) => a.position - b.position)
  const getChildren = (parentId: string) => categories.filter((c) => c.parent_id === parentId).sort((a, b) => a.position - b.position)

  const categoriesTab = (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* List — 55% */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <span className="font-body text-[13px] text-warm-gray">{categories.length} categorías</span>
          <button onClick={() => setEditingCat('new')}
            className="flex items-center gap-1.5 font-body text-[12px] uppercase tracking-[0.08em] text-charcoal hover:text-champagne transition-colors">
            <Plus className="h-4 w-4" strokeWidth={1.5} /> Nueva categoría
          </button>
        </div>
        <div className="bg-white border border-pale-gray rounded-lg overflow-hidden">
          {topLevel.map((cat) => (
            <div key={cat.id}>
              <CategoryRow cat={cat} onEdit={() => setEditingCat(cat)} onDelete={() => setDeleteCat(cat)} />
              {getChildren(cat.id).map((child) => (
                <CategoryRow key={child.id} cat={child} indent onEdit={() => setEditingCat(child)} onDelete={() => setDeleteCat(child)} />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Form — 45% */}
      <div className="w-full lg:w-[45%]">
        {editingCat && (
          <CategoryForm
            category={editingCat === 'new' ? null : editingCat}
            categories={categories}
            onSave={saveCategory}
            onCancel={() => setEditingCat(null)}
          />
        )}
      </div>
    </div>
  )

  const collectionsTab = (
    <div>
      <div className="flex items-center justify-between mb-6">
        <span className="font-body text-[13px] text-warm-gray">{collections.length} colecciones</span>
        <button onClick={() => setEditingCol('new')}
          className="flex items-center gap-1.5 font-body text-[12px] uppercase tracking-[0.08em] text-charcoal hover:text-champagne transition-colors">
          <Plus className="h-4 w-4" strokeWidth={1.5} /> Nueva colección
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {collections.map((col) => (
          <div key={col.id}
            onClick={() => setEditingCol(col)}
            className="group relative h-[200px] overflow-hidden rounded-lg cursor-pointer border border-pale-gray">
            <div className={cn(
              'absolute inset-0 bg-gradient-to-br from-[#8B7355] to-[#6B5A45]',
              'transition-transform duration-500 ease-luxury group-hover:scale-105'
            )}>
              {col.image_url && (
                <Image src={col.image_url} alt={col.name} fill className="object-cover" sizes="33vw" />
              )}
            </div>
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300" />
            <div className="relative h-full flex flex-col items-center justify-center text-center z-10 p-4">
              <span className="font-body text-[14px] uppercase tracking-[0.12em] text-white font-medium">
                {col.name}
              </span>
              {col.season && (
                <span className="font-body text-[11px] text-white/70 mt-1">{col.season}</span>
              )}
              <span className="font-body text-[10px] text-white/60 mt-1">
                {col.product_count} productos
              </span>
              <span className={cn(
                'mt-2 px-2 py-0.5 font-body text-[9px] uppercase tracking-[0.1em] rounded-full',
                col.is_active ? 'bg-deep-forest/80 text-white' : 'bg-white/20 text-white/70'
              )}>
                {col.is_active ? 'Activa' : 'Inactiva'}
              </span>
            </div>
            {/* Delete */}
            <button
              onClick={(e) => { e.stopPropagation(); setDeleteCol(col) }}
              className="absolute top-3 right-3 z-20 h-7 w-7 flex items-center justify-center bg-black/30 text-white/70 hover:text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Collection modal */}
      <CollectionFormModal
        collection={editingCol === 'new' ? null : (editingCol as ColWithCount)}
        isOpen={!!editingCol}
        onClose={() => setEditingCol(null)}
        onSave={saveCollection}
      />
    </div>
  )

  return (
    <div>
      <Tabs
        tabs={[
          { id: 'categories', label: 'Categorías', content: categoriesTab },
          { id: 'collections', label: 'Colecciones', content: collectionsTab },
        ]}
      />

      {/* Delete category modal */}
      <Modal isOpen={!!deleteCat} onClose={() => setDeleteCat(null)} title="Eliminar categoría" size="sm">
        {deleteCat && deleteCat.product_count > 0 ? (
          <p className="font-body text-[14px] text-dark-gray mb-6">
            Esta categoría tiene <strong>{deleteCat.product_count} productos</strong>. Mové primero los productos a otra categoría.
          </p>
        ) : (
          <p className="font-body text-[14px] text-dark-gray mb-6">
            ¿Eliminar <strong>{deleteCat?.name}</strong>? No se puede deshacer.
          </p>
        )}
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setDeleteCat(null)}>Cancelar</Button>
          <Button variant="danger" disabled={!!deleteCat && deleteCat.product_count > 0}
            onClick={handleDeleteCategory}>Eliminar</Button>
        </div>
      </Modal>

      {/* Delete collection modal */}
      <Modal isOpen={!!deleteCol} onClose={() => setDeleteCol(null)} title="Eliminar colección" size="sm">
        <p className="font-body text-[14px] text-dark-gray mb-6">
          ¿Eliminar <strong>{deleteCol?.name}</strong>? No se puede deshacer.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setDeleteCol(null)}>Cancelar</Button>
          <Button variant="danger" onClick={handleDeleteCollection}>Eliminar</Button>
        </div>
      </Modal>
    </div>
  )
}

// ─── CATEGORY ROW ─────────────────────────────────────────
function CategoryRow({
  cat, indent, onEdit, onDelete,
}: {
  cat: CatWithCount
  indent?: boolean
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className={cn(
      'flex items-center gap-3 px-4 py-3 border-b border-pale-gray last:border-0 hover:bg-ivory transition-colors',
      indent && 'pl-12'
    )}>
      <GripVertical className="h-4 w-4 text-pale-gray cursor-grab shrink-0" />
      <div className="h-10 w-10 rounded-full bg-cream shrink-0 overflow-hidden flex items-center justify-center">
        {cat.image_url ? (
          <Image src={cat.image_url} alt={cat.name} width={40} height={40} className="object-cover rounded-full" />
        ) : (
          <span className="font-body text-[12px] text-warm-gray">{cat.name.charAt(0)}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-body text-[13px] text-charcoal">{cat.name}</p>
        <p className="font-body text-[11px] text-warm-gray">{cat.product_count} productos</p>
      </div>
      <button onClick={onEdit} className="text-warm-gray hover:text-charcoal transition-colors p-1">
        <Pencil className="h-4 w-4" strokeWidth={1.5} />
      </button>
      <button onClick={onDelete} className="text-warm-gray hover:text-muted-red transition-colors p-1">
        <Trash2 className="h-4 w-4" strokeWidth={1.5} />
      </button>
    </div>
  )
}
