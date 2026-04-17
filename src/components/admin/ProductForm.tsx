'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, AlertCircle } from 'lucide-react'
import type { Product, Category, Collection } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { deleteProductImage } from '@/lib/supabase/storage'
import { slugify, cn } from '@/lib/utils'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'
import Toggle from '@/components/ui/Toggle'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import ProductImageUploader, { UploaderImage } from '@/components/admin/ProductImageUploader'

interface VariantRow {
  id?: string   // presente si ya existe en DB, ausente si es nueva
  size: string
  color: string
  color_hex: string
  stock: number
  sku: string
}

interface ProductFormProps {
  product?: Product | null
  categories: Category[]
  collections: Collection[]
}

const PRODUCT_STATUS_VALUES: Product['status'][] = ['active', 'draft', 'archived']
function isProductStatus(value: string): value is Product['status'] {
  return PRODUCT_STATUS_VALUES.includes(value as Product['status'])
}

export default function ProductForm({ product, categories, collections }: ProductFormProps) {
  const router = useRouter()
  const isNew = !product

  const [name, setName] = useState(product?.name || '')
  const [slug, setSlug] = useState(product?.slug || '')
  const [description, setDescription] = useState(product?.description || '')
  const [price, setPrice] = useState(product?.price?.toString() || '')
  const [comparePrice, setComparePrice] = useState(product?.compare_at_price?.toString() || '')
  const [categoryId, setCategoryId] = useState(product?.category_id || '')
  const [collectionId, setCollectionId] = useState(product?.collection_id || '')
  const [status, setStatus] = useState<Product['status']>(product?.status ?? 'draft')
  const [isFeatured, setIsFeatured] = useState(product?.is_featured || false)
  const [isNewArrival, setIsNewArrival] = useState(product?.is_new ?? true)

  // FIX: columna real es `url` (no `image_url`)
  const [images, setImages] = useState<UploaderImage[]>(
    product?.images?.map((img) => ({
      id: img.id,
      url: img.url,
      dbId: img.id,
    })) || []
  )

  const [variants, setVariants] = useState<VariantRow[]>(
    product?.variants?.map((v) => ({
      id: v.id, size: v.size, color: v.color, color_hex: v.color_hex, stock: v.stock, sku: v.sku,
    })) || [{ size: '', color: '', color_hex: '#1A1A1A', stock: 0, sku: '' }]
  )

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [deleteVariant, setDeleteVariant] = useState<number | null>(null)

  // IDs originales de variantes (para detectar eliminadas en el diff)
  const originalVariantIdsRef = useRef<Set<string>>(
    new Set(product?.variants?.map((v) => v.id) || [])
  )
  // URLs originales de imágenes (para cleanup de storage al descartar)
  const originalImageUrlsRef = useRef<Set<string>>(
    new Set(product?.images?.map((img) => img.url) || [])
  )

  useEffect(() => {
    if (isNew || !product?.slug) setSlug(slugify(name))
  }, [name, isNew, product?.slug])

  useEffect(() => { setHasChanges(true) }, [
    name, slug, description, price, comparePrice, categoryId, collectionId,
    status, isFeatured, isNewArrival, variants, images,
  ])

  const discount = comparePrice && price
    ? Math.round((1 - parseFloat(price) / parseFloat(comparePrice)) * 100)
    : null

  function updateVariant(index: number, field: keyof VariantRow, value: string | number) {
    setVariants((prev) => prev.map((v, i) => i === index ? { ...v, [field]: value } : v))
  }
  function addVariant() {
    setVariants((prev) => [...prev, { size: '', color: '', color_hex: '#1A1A1A', stock: 0, sku: '' }])
  }
  function removeVariant(index: number) {
    setVariants((prev) => prev.filter((_, i) => i !== index))
    setDeleteVariant(null)
  }

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'El nombre es obligatorio'
    if (!price || parseFloat(price) <= 0) e.price = 'Indicá un precio válido'
    if (variants.length === 0) e.variants = 'Se requiere al menos una variante'
    variants.forEach((v, i) => {
      if (!v.size) e[`variant_size_${i}`] = 'Talle obligatorio'
      if (!v.color) e[`variant_color_${i}`] = 'Color obligatorio'
    })
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSave() {
    if (!validate()) return
    setSaving(true)
    setSaveError(null)
    const supabase = createClient()

    const productData = {
      name, slug, description,
      price: parseFloat(price),
      compare_at_price: comparePrice ? parseFloat(comparePrice) : null,
      category_id: categoryId || null,
      collection_id: collectionId || null,
      status, is_featured: isFeatured, is_new: isNewArrival,
    }

    try {
      let productId = product?.id

      // 1) UPSERT del producto
      if (isNew) {
        const { data, error } = await supabase.from('products').insert(productData).select().single()
        if (error) throw error
        productId = data.id
      } else {
        const { error } = await supabase.from('products').update(productData).eq('id', productId)
        if (error) throw error
      }

      // 2) DIFF de variantes (preserva IDs existentes → no rompe carritos persistidos)
      const currentIdsInForm = new Set(
        variants.filter((v) => v.id).map((v) => v.id as string)
      )
      const deletedVariantIds = Array.from(originalVariantIdsRef.current)
        .filter((id) => !currentIdsInForm.has(id))

      const defaultSku = (v: VariantRow) =>
        v.sku || `ME-${slug.toUpperCase().slice(0, 4)}-${v.size}-${v.color.slice(0, 3).toUpperCase()}`

      // 2a) Soft-delete variantes removidas del form
      if (deletedVariantIds.length > 0) {
        const { error } = await supabase
          .from('product_variants')
          .update({ is_active: false })
          .in('id', deletedVariantIds)
        if (error) throw error
      }

      // 2b) UPDATE variantes existentes (mantiene ID)
      const toUpdate = variants.filter((v) => v.id)
      for (const v of toUpdate) {
        const { error } = await supabase
          .from('product_variants')
          .update({
            size: v.size,
            color: v.color,
            color_hex: v.color_hex,
            stock: v.stock,
            sku: defaultSku(v),
            is_active: true,
          })
          .eq('id', v.id as string)
        if (error) throw error
      }

      // 2c) INSERT variantes nuevas
      const toInsert = variants.filter((v) => !v.id).map((v) => ({
        product_id: productId,
        size: v.size,
        color: v.color,
        color_hex: v.color_hex,
        stock: v.stock,
        sku: defaultSku(v),
        is_active: true,
      }))
      if (toInsert.length > 0) {
        const { error } = await supabase.from('product_variants').insert(toInsert)
        if (error) throw error
      }

      // 3) DIFF de imágenes — por ahora mantenemos estrategia simple
      //    (delete + insert por orden/position), pero solo tocando product_images
      //    que es una tabla sin referencias externas críticas.
      if (!isNew) {
        await supabase.from('product_images').delete().eq('product_id', productId)
      }
      if (images.length > 0) {
        const imageRows = images.map((img, index) => ({
          product_id: productId,
          url: img.url,          // FIX: columna real es `url`
          alt: name,             // alt por defecto = nombre del producto
          position: index,
        }))
        const { error: imagesError } = await supabase.from('product_images').insert(imageRows)
        if (imagesError) throw imagesError
      }

      // 4) Cleanup de storage: borrar del bucket las imágenes quitadas del form
      const currentUrls = new Set(images.map((i) => i.url))
      const removedUrls = Array.from(originalImageUrlsRef.current)
        .filter((url) => !currentUrls.has(url))
      await Promise.all(
        removedUrls.map((url) =>
          deleteProductImage(url).catch((e) => console.error('Cleanup bucket error:', e))
        )
      )

      router.push('/admin/products')
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido al guardar'
      setSaveError(message)
      setSaving(false)
    }
  }

  async function handleDiscard() {
    // Limpieza de bucket: borrar solo lo subido en esta sesión (no estaba en original)
    const newImages = images.filter((img) => !originalImageUrlsRef.current.has(img.url))
    await Promise.all(
      newImages.map((img) =>
        deleteProductImage(img.url).catch((e) => console.error('Cleanup error:', e))
      )
    )
    router.push('/admin/products')
  }

  const categoryOptions = categories.map((c) => ({ label: c.name, value: c.id }))
  const collectionOptions = [
    { label: 'Ninguna', value: '' },
    ...collections.map((c) => ({ label: c.name, value: c.id })),
  ]
  const statusOptions = [
    { label: 'Activo', value: 'active' },
    { label: 'Borrador', value: 'draft' },
    { label: 'Archivado', value: 'archived' },
  ]

  return (
    <div className="pb-24">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left — 65% */}
        <div className="flex-1 space-y-6">
          <ProductImageUploader
            images={images}
            onChange={setImages}
            productSlug={slug || null}
            disabled={saving}
          />

          <div className="bg-white border border-pale-gray rounded-lg p-8">
            <h3 className="font-body text-[12px] uppercase tracking-[0.08em] text-warm-gray mb-6">Información básica</h3>
            <div className="space-y-5">
              <Input label="Nombre del producto" id="name" value={name}
                onChange={(e) => setName(e.target.value)} error={errors.name} />
              <Input label="Slug" id="slug" value={slug}
                onChange={(e) => setSlug(e.target.value)} />
              <Textarea label="Descripción" id="description" value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Una descripción que invite a comprar…" autoResize />
            </div>
          </div>

          <div className="bg-white border border-pale-gray rounded-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-body text-[12px] uppercase tracking-[0.08em] text-warm-gray">Variantes</h3>
              <button onClick={addVariant}
                className="flex items-center gap-1 font-body text-[12px] text-charcoal hover:text-champagne transition-colors">
                <Plus className="h-3.5 w-3.5" /> Agregar variante
              </button>
            </div>
            {errors.variants && <p className="font-body text-[12px] text-muted-red mb-4">{errors.variants}</p>}
            <div className="space-y-3">
              <div className="hidden md:grid grid-cols-[1fr_1fr_80px_80px_1fr_40px] gap-3 font-body text-[10px] uppercase tracking-[0.08em] text-warm-gray px-1">
                <span>Talle</span><span>Color</span><span>Hex</span><span>Stock</span><span>SKU</span><span />
              </div>
              {variants.map((v, i) => (
                <div key={v.id ?? `new-${i}`} className="grid grid-cols-2 md:grid-cols-[1fr_1fr_80px_80px_1fr_40px] gap-3 items-start p-3 bg-ivory rounded">
                  <input value={v.size}
                    onChange={(e) => updateVariant(i, 'size', e.target.value)}
                    placeholder="Talle"
                    className={cn('border px-3 py-2 font-body text-[13px] bg-white rounded focus:outline-none focus:border-charcoal',
                      errors[`variant_size_${i}`] ? 'border-muted-red' : 'border-pale-gray')} />
                  <input value={v.color}
                    onChange={(e) => updateVariant(i, 'color', e.target.value)}
                    placeholder="Color"
                    className={cn('border px-3 py-2 font-body text-[13px] bg-white rounded focus:outline-none focus:border-charcoal',
                      errors[`variant_color_${i}`] ? 'border-muted-red' : 'border-pale-gray')} />
                  <input type="color" value={v.color_hex}
                    onChange={(e) => updateVariant(i, 'color_hex', e.target.value)}
                    className="h-[38px] w-full border border-pale-gray rounded cursor-pointer bg-white" />
                  <input type="number" min="0" value={v.stock}
                    onChange={(e) => updateVariant(i, 'stock', parseInt(e.target.value) || 0)}
                    className="border border-pale-gray px-3 py-2 font-body text-[13px] bg-white rounded focus:outline-none focus:border-charcoal" />
                  <input value={v.sku}
                    onChange={(e) => updateVariant(i, 'sku', e.target.value)}
                    placeholder="Autogenerado"
                    className="border border-pale-gray px-3 py-2 font-body text-[13px] bg-white rounded focus:outline-none focus:border-charcoal" />
                  <button onClick={() => variants.length > 1 ? setDeleteVariant(i) : null}
                    className="h-[38px] flex items-center justify-center text-warm-gray hover:text-muted-red transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — 35% */}
        <div className="w-full lg:w-[35%] space-y-6">
          <div className="bg-white border border-pale-gray rounded-lg p-6">
            <h3 className="font-body text-[12px] uppercase tracking-[0.08em] text-warm-gray mb-5">Estado y visibilidad</h3>
            <div className="space-y-5">
              <Select
                label="Estado"
                options={statusOptions}
                value={status}
                onChange={(value) => {
                  if (isProductStatus(value)) setStatus(value)
                }}
              />
              <Toggle checked={isFeatured} onChange={setIsFeatured} label="Producto destacado" />
              <Toggle checked={isNewArrival} onChange={setIsNewArrival} label="Novedad" />
            </div>
          </div>

          <div className="bg-white border border-pale-gray rounded-lg p-6">
            <h3 className="font-body text-[12px] uppercase tracking-[0.08em] text-warm-gray mb-5">Precios</h3>
            <div className="space-y-5">
              <Input label="Precio (USD)" id="price" type="number" value={price}
                onChange={(e) => setPrice(e.target.value)} error={errors.price} />
              <Input label="Precio tachado (USD)" id="comparePrice" type="number" value={comparePrice}
                onChange={(e) => setComparePrice(e.target.value)} />
              {discount && discount > 0 && (
                <p className="font-body text-[12px] text-deep-forest">{discount}% de descuento</p>
              )}
            </div>
          </div>

          <div className="bg-white border border-pale-gray rounded-lg p-6">
            <h3 className="font-body text-[12px] uppercase tracking-[0.08em] text-warm-gray mb-5">Organización</h3>
            <div className="space-y-5">
              <Select label="Categoría" options={categoryOptions} value={categoryId} onChange={setCategoryId} />
              <Select label="Colección" options={collectionOptions} value={collectionId} onChange={setCollectionId} />
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-pale-gray px-8 py-4 flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          {saveError ? (
            <div className="flex items-center gap-2 text-muted-red">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span className="font-body text-[12px] truncate">{saveError}</span>
            </div>
          ) : hasChanges ? (
            <span className="font-body text-[12px] text-warm-gray italic">Cambios sin guardar</span>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={handleDiscard}>Descartar</Button>
          <Button loading={saving} onClick={handleSave}>
            {isNew ? 'Crear producto' : 'Guardar cambios'}
          </Button>
        </div>
      </div>

      <Modal isOpen={deleteVariant !== null} onClose={() => setDeleteVariant(null)} title="Quitar variante" size="sm">
        <p className="font-body text-[14px] text-dark-gray mb-6">¿Quitar esta variante?</p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setDeleteVariant(null)}>Cancelar</Button>
          <Button variant="danger" onClick={() => deleteVariant !== null && removeVariant(deleteVariant)}>Quitar</Button>
        </div>
      </Modal>
    </div>
  )
}
