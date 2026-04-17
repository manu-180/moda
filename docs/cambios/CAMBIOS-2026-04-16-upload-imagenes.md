# CAMBIOS MAISON ÉLARA — Upload de imágenes a Supabase Storage desde el admin

> **Para Cursor (modo auto):** Aplicá los siguientes cambios al proyecto.
> Cada cambio indica archivo, acción y código final.
> No modifiques nada que no esté listado acá.

---

## 🎨 Contexto de diseño

- Paleta: `ivory`, `cream`, `charcoal`, `pale-gray`, `warm-gray`, `champagne`, `muted-red` (ya definidos en `tailwind.config.ts`).
- Tipografía: `font-body` (Inter) para todo el uploader. Tracking `[0.08em]` y uppercase para labels/hints, como el resto del admin.
- Estilo: bordes finos (`border-pale-gray`), fondos `bg-white` y `bg-ivory`, mucho aire. Consistente con las demás cards del `ProductForm`.
- Animación: reutilizamos la clase `animate-shimmer` definida en Tailwind para el estado de carga.
- Easing de hover/transiciones: `transition-colors` (suficiente, no meter easings custom acá).

Referencias estéticas del patrón de upload: Shopify Admin, Linear attachments, Stripe Dashboard media.

---

## 📦 Dependencias nuevas

Instalar desde el root del proyecto:

```bash
npm install @dnd-kit/core@^6.1.0 @dnd-kit/sortable@^8.0.0 @dnd-kit/utilities@^3.2.2
```

Total aprox. **15KB gzip**. Son las librerías estándar de drag-and-drop accesible en React (las usan Linear y Notion).

---

## 📝 CAMBIO 1 — Crear helper de Storage

**Archivo:** `src/lib/supabase/storage.ts`
**Acción:** Crear archivo nuevo
**Justificación:**
1. Centralizar toda la lógica de Storage (upload, delete, path extraction) en un solo lugar reutilizable.
2. Separar responsabilidades: el componente de UI no debe saber de paths de buckets.
3. Manejar errores de forma consistente.
4. La función `extractStoragePath` nos permite borrar archivos del bucket a partir de la URL pública guardada en `product_images.image_url`.

**Código:**

```typescript
import { createClient } from '@/lib/supabase/client'

const BUCKET = 'products'
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export interface UploadResult {
  url: string
  path: string
}

export class StorageError extends Error {
  constructor(message: string, public code: 'size' | 'type' | 'upload' | 'delete' | 'url') {
    super(message)
    this.name = 'StorageError'
  }
}

/**
 * Valida un archivo antes de subirlo.
 * Lanza StorageError si no pasa.
 */
export function validateImageFile(file: File): void {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new StorageError(
      `Formato no permitido: ${file.type || 'desconocido'}. Usá JPG, PNG o WebP.`,
      'type'
    )
  }
  if (file.size > MAX_SIZE_BYTES) {
    const mb = (file.size / 1024 / 1024).toFixed(1)
    throw new StorageError(`La imagen pesa ${mb}MB. El máximo es 5MB.`, 'size')
  }
}

/**
 * Sube una imagen al bucket "products".
 * Genera un path único: `{productSlug || 'draft'}/{timestamp}-{randomId}.{ext}`
 * Retorna la URL pública y el path interno del bucket.
 */
export async function uploadProductImage(
  file: File,
  productSlug: string | null
): Promise<UploadResult> {
  validateImageFile(file)

  const supabase = createClient()
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const folder = productSlug && productSlug.trim() ? productSlug : 'draft'
  const randomId = Math.random().toString(36).slice(2, 10)
  const timestamp = Date.now()
  const path = `${folder}/${timestamp}-${randomId}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    })

  if (uploadError) {
    throw new StorageError(`No se pudo subir la imagen: ${uploadError.message}`, 'upload')
  }

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path)
  if (!urlData?.publicUrl) {
    throw new StorageError('No se pudo obtener la URL pública de la imagen.', 'url')
  }

  return { url: urlData.publicUrl, path }
}

/**
 * Extrae el path interno del bucket a partir de una URL pública de Supabase Storage.
 * Devuelve null si la URL no pertenece al bucket "products".
 */
export function extractStoragePath(publicUrl: string): string | null {
  const marker = `/storage/v1/object/public/${BUCKET}/`
  const idx = publicUrl.indexOf(marker)
  if (idx === -1) return null
  return publicUrl.slice(idx + marker.length)
}

/**
 * Elimina una imagen del bucket "products" a partir de su URL pública o path interno.
 * Silencioso si la imagen no pertenece al bucket (URLs externas como Unsplash).
 */
export async function deleteProductImage(urlOrPath: string): Promise<void> {
  const path = urlOrPath.startsWith('http') ? extractStoragePath(urlOrPath) : urlOrPath
  if (!path) return // URL externa, no hacemos nada

  const supabase = createClient()
  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) {
    throw new StorageError(`No se pudo eliminar la imagen: ${error.message}`, 'delete')
  }
}
```

---

## 📝 CAMBIO 2 — Crear componente `ProductImageUploader`

**Archivo:** `src/components/admin/ProductImageUploader.tsx`
**Acción:** Crear archivo nuevo
**Justificación:**
1. Componente dedicado que encapsula toda la UX de upload (dropzone, preview, progress, reorder, delete).
2. Totalmente controlado desde el `ProductForm` vía props `images` / `onChange` — no tiene estado propio de la lista.
3. Usa `@dnd-kit` para reordenamiento accesible con teclado y touch.
4. Valida formato y tamaño antes de subir.
5. Muestra errores inline por archivo (no un toast global que desaparece).

**Código:**

```typescript
'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Upload, X, AlertCircle, Loader2, GripVertical, Star } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { uploadProductImage, deleteProductImage, StorageError } from '@/lib/supabase/storage'
import { cn } from '@/lib/utils'

export interface UploaderImage {
  id: string // uuid temporal para React keys (no es el id de la DB)
  url: string
  dbId?: string // id real en product_images (si ya está guardada en la DB)
}

interface ProductImageUploaderProps {
  images: UploaderImage[]
  onChange: (images: UploaderImage[]) => void
  productSlug: string | null
  disabled?: boolean
}

interface UploadingFile {
  id: string
  name: string
  progress: number // 0-100 (aproximado, Supabase no emite progreso real)
  error?: string
}

export default function ProductImageUploader({
  images,
  onChange,
  productSlug,
  disabled = false,
}: ProductImageUploaderProps) {
  const [uploading, setUploading] = useState<UploadingFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files)
      if (fileArray.length === 0) return

      // Crear entradas de progreso inmediatamente
      const uploadingEntries: UploadingFile[] = fileArray.map((f) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: f.name,
        progress: 10,
      }))
      setUploading((prev) => [...prev, ...uploadingEntries])

      // Subir en paralelo
      await Promise.all(
        fileArray.map(async (file, idx) => {
          const entryId = uploadingEntries[idx].id
          try {
            // Simulamos progreso (Supabase JS client no emite progreso nativo)
            setUploading((prev) =>
              prev.map((u) => (u.id === entryId ? { ...u, progress: 50 } : u))
            )
            const result = await uploadProductImage(file, productSlug)
            setUploading((prev) =>
              prev.map((u) => (u.id === entryId ? { ...u, progress: 100 } : u))
            )
            // Agregar a la lista de imágenes
            const newImage: UploaderImage = {
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              url: result.url,
            }
            onChange([...imagesRef.current, newImage])
            // Remover del tracking de upload después de un instante
            setTimeout(() => {
              setUploading((prev) => prev.filter((u) => u.id !== entryId))
            }, 400)
          } catch (err) {
            const msg = err instanceof StorageError ? err.message : 'Error desconocido al subir'
            setUploading((prev) =>
              prev.map((u) => (u.id === entryId ? { ...u, progress: 0, error: msg } : u))
            )
          }
        })
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [productSlug, onChange]
  )

  // Ref mutable para que los uploads en paralelo vean la versión actual de `images`
  const imagesRef = useRef(images)
  imagesRef.current = images

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (disabled) return
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files)
    // Reset para permitir seleccionar el mismo archivo de nuevo
    e.target.value = ''
  }

  const handleRemove = async (image: UploaderImage) => {
    // Optimistic UI: quitamos de la lista al toque
    onChange(images.filter((i) => i.id !== image.id))
    // Borrar del bucket en background (silencioso si falla, no bloqueamos la UX)
    try {
      await deleteProductImage(image.url)
    } catch (err) {
      console.error('Error al eliminar del bucket:', err)
    }
  }

  const handleDismissError = (id: string) => {
    setUploading((prev) => prev.filter((u) => u.id !== id))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = images.findIndex((i) => i.id === active.id)
    const newIndex = images.findIndex((i) => i.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    onChange(arrayMove(images, oldIndex, newIndex))
  }

  return (
    <div className="bg-white border border-pale-gray rounded-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-body text-[12px] uppercase tracking-[0.08em] text-warm-gray">
          Imágenes del producto
        </h3>
        <span className="font-body text-[11px] text-warm-gray">
          {images.length} {images.length === 1 ? 'imagen' : 'imágenes'}
        </span>
      </div>

      {/* Dropzone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          'border border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors',
          isDragOver
            ? 'border-champagne bg-ivory'
            : 'border-pale-gray hover:border-warm-gray hover:bg-ivory',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
        />
        <Upload className="h-6 w-6 mx-auto mb-3 text-warm-gray" strokeWidth={1.5} />
        <p className="font-body text-[13px] text-charcoal mb-1">
          Arrastrá imágenes acá o <span className="underline">elegí desde tu equipo</span>
        </p>
        <p className="font-body text-[11px] text-warm-gray uppercase tracking-[0.08em]">
          JPG · PNG · WebP · Máx 5MB por imagen
        </p>
      </div>

      {/* Uploads en progreso y errores */}
      {uploading.length > 0 && (
        <div className="mt-4 space-y-2">
          {uploading.map((u) => (
            <div
              key={u.id}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded border',
                u.error ? 'border-muted-red bg-muted-red/5' : 'border-pale-gray bg-ivory'
              )}
            >
              {u.error ? (
                <AlertCircle className="h-4 w-4 text-muted-red shrink-0" />
              ) : (
                <Loader2 className="h-4 w-4 text-warm-gray animate-spin shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-body text-[12px] text-charcoal truncate">{u.name}</p>
                {u.error ? (
                  <p className="font-body text-[11px] text-muted-red mt-0.5">{u.error}</p>
                ) : (
                  <div className="h-[2px] bg-pale-gray rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-charcoal transition-all duration-300"
                      style={{ width: `${u.progress}%` }}
                    />
                  </div>
                )}
              </div>
              {u.error && (
                <button
                  onClick={() => handleDismissError(u.id)}
                  className="text-warm-gray hover:text-charcoal transition-colors"
                  aria-label="Descartar"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Grid de imágenes con drag-to-reorder */}
      {images.length > 0 && (
        <>
          <p className="font-body text-[11px] text-warm-gray uppercase tracking-[0.08em] mt-6 mb-3">
            Arrastrá para reordenar · La primera es la principal
          </p>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={images.map((i) => i.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {images.map((image, index) => (
                  <SortableImage
                    key={image.id}
                    image={image}
                    isPrimary={index === 0}
                    onRemove={() => handleRemove(image)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </>
      )}
    </div>
  )
}

// ——————————————————————————————————————
// Subcomponente: imagen sortable
// ——————————————————————————————————————

interface SortableImageProps {
  image: UploaderImage
  isPrimary: boolean
  onRemove: () => void
}

function SortableImage({ image, isPrimary, onRemove }: SortableImageProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: image.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group aspect-[3/4] bg-ivory rounded overflow-hidden border border-pale-gray"
    >
      <Image
        src={image.url}
        alt=""
        fill
        sizes="(max-width: 768px) 50vw, 25vw"
        className="object-cover"
      />

      {/* Badge "Principal" */}
      {isPrimary && (
        <div className="absolute top-2 left-2 bg-charcoal text-ivory px-2 py-1 rounded flex items-center gap-1">
          <Star className="h-2.5 w-2.5 fill-current" />
          <span className="font-body text-[9px] uppercase tracking-[0.08em]">Principal</span>
        </div>
      )}

      {/* Handle de drag (siempre visible, arriba-derecha) */}
      <button
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-1.5 rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Reordenar imagen"
      >
        <GripVertical className="h-3.5 w-3.5 text-charcoal" />
      </button>

      {/* Botón eliminar (abajo-derecha) */}
      <button
        onClick={onRemove}
        className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted-red hover:text-white"
        aria-label="Eliminar imagen"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
```

---

## 📝 CAMBIO 3 — Integrar el uploader en `ProductForm.tsx`

**Archivo:** `src/components/admin/ProductForm.tsx`
**Acción:** Reemplazar completo
**Justificación:**
1. Agregar estado de imágenes (`images`) inicializado desde `product.images`.
2. Renderizar el `<ProductImageUploader />` como primera card del lado izquierdo (arriba de "Información básica") — las imágenes son lo primero que mira el usuario en un admin de e-commerce.
3. En `handleSave`, después de guardar producto y variantes, sincronizar `product_images`: delete + insert (mismo patrón que variantes, consistente con lo existente).
4. En "Descartar", borrar del bucket las imágenes que se subieron en esta sesión pero que todavía no están en la DB (limpia huérfanos cuando es un producto nuevo que se cancela).
5. Mejorar manejo de errores: el `catch {}` vacío actual se come errores silenciosamente. Agregamos estado `saveError` y lo mostramos en pantalla.
6. Marcar el formulario como `hasChanges` también cuando cambian las imágenes.

**Código:**

```typescript
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
  id?: string
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

  const [images, setImages] = useState<UploaderImage[]>(
    product?.images?.map((img) => ({
      id: img.id,
      url: img.image_url,
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

  // Guardamos las URLs originales de la DB para detectar cuáles son "nuevas"
  // (subidas en esta sesión y candidatas a limpiar si se descarta).
  const originalUrlsRef = useRef<Set<string>>(
    new Set(product?.images?.map((img) => img.image_url) || [])
  )

  // Auto-generate slug from name
  useEffect(() => {
    if (isNew || !product?.slug) setSlug(slugify(name))
  }, [name, isNew, product?.slug])

  // Track changes
  useEffect(() => { setHasChanges(true) }, [
    name, slug, description, price, comparePrice, categoryId, collectionId,
    status, isFeatured, isNewArrival, variants, images,
  ])

  // Discount %
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
      if (isNew) {
        const { data, error } = await supabase.from('products').insert(productData).select().single()
        if (error) throw error
        productId = data.id
      } else {
        const { error } = await supabase.from('products').update(productData).eq('id', productId)
        if (error) throw error
        await supabase.from('product_variants').delete().eq('product_id', productId)
      }

      // Variants
      const variantData = variants.map((v) => ({
        product_id: productId,
        size: v.size,
        color: v.color,
        color_hex: v.color_hex,
        stock: v.stock,
        sku: v.sku || `ME-${slug.toUpperCase().slice(0, 4)}-${v.size}-${v.color.slice(0, 3).toUpperCase()}`,
      }))
      const { error: variantsError } = await supabase.from('product_variants').insert(variantData)
      if (variantsError) throw variantsError

      // Images — delete all existing rows and re-insert with current order
      if (!isNew) {
        await supabase.from('product_images').delete().eq('product_id', productId)
      }
      if (images.length > 0) {
        const imageRows = images.map((img, index) => ({
          product_id: productId,
          image_url: img.url,
          position: index,
        }))
        const { error: imagesError } = await supabase.from('product_images').insert(imageRows)
        if (imagesError) throw imagesError
      }

      router.push('/admin/products')
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido al guardar'
      setSaveError(message)
      setSaving(false)
    }
  }

  async function handleDiscard() {
    // Limpiar del bucket las imágenes que se subieron en esta sesión
    // y que todavía no están en la DB (huérfanos si el usuario cancela).
    const newImages = images.filter((img) => !originalUrlsRef.current.has(img.url))
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
          {/* Images */}
          <ProductImageUploader
            images={images}
            onChange={setImages}
            productSlug={slug || null}
            disabled={saving}
          />

          {/* Basic Info */}
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

          {/* Variants */}
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
              {/* Header */}
              <div className="hidden md:grid grid-cols-[1fr_1fr_80px_80px_1fr_40px] gap-3 font-body text-[10px] uppercase tracking-[0.08em] text-warm-gray px-1">
                <span>Talle</span><span>Color</span><span>Hex</span><span>Stock</span><span>SKU</span><span />
              </div>
              {variants.map((v, i) => (
                <div key={i} className="grid grid-cols-2 md:grid-cols-[1fr_1fr_80px_80px_1fr_40px] gap-3 items-start p-3 bg-ivory rounded">
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
          {/* Status */}
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

          {/* Pricing */}
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

          {/* Organization */}
          <div className="bg-white border border-pale-gray rounded-lg p-6">
            <h3 className="font-body text-[12px] uppercase tracking-[0.08em] text-warm-gray mb-5">Organización</h3>
            <div className="space-y-5">
              <Select label="Categoría" options={categoryOptions} value={categoryId} onChange={setCategoryId} />
              <Select label="Colección" options={collectionOptions} value={collectionId} onChange={setCollectionId} />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom save bar */}
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

      {/* Delete variant modal */}
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
```

---

## ✅ Checklist final para Cursor

- [ ] Ejecutar `npm install @dnd-kit/core@^6.1.0 @dnd-kit/sortable@^8.0.0 @dnd-kit/utilities@^3.2.2`
- [ ] Verificar que `package.json` quedó con las 3 nuevas deps y que `package-lock.json` se actualizó.
- [ ] Crear `src/lib/supabase/storage.ts` con el código de CAMBIO 1.
- [ ] Crear `src/components/admin/ProductImageUploader.tsx` con el código de CAMBIO 2.
- [ ] Reemplazar `src/components/admin/ProductForm.tsx` con el código de CAMBIO 3.
- [ ] Verificar que el tipo `Product` en `src/types/index.ts` (o donde viva) tenga `images?: ProductImage[]` con `image_url: string`, `id: string`, `position: number`. Si no, avisar — no tocar el tipo sin confirmar antes.
- [ ] Correr `npm run lint` → no debe haber errores nuevos.
- [ ] Correr `npm run build` → debe compilar sin errores.
- [ ] Correr `npm run dev` y probar en `/admin/products/new`:
  - [ ] Dropzone recibe drag & drop y abre selector con click.
  - [ ] Subida en paralelo de 2-3 imágenes muestra barra de progreso por cada una.
  - [ ] Imagen mayor a 5MB muestra error inline sin romper nada.
  - [ ] Drag-to-reorder funciona; la primera imagen muestra badge "Principal".
  - [ ] Eliminar una imagen la saca del grid al instante.
  - [ ] Guardar persiste las imágenes en `product_images` con `position` correcto.
- [ ] Probar en un producto existente (`/admin/products/[id]`):
  - [ ] Al abrir se ven las imágenes actuales en el orden guardado.
  - [ ] Al reordenar + guardar, el nuevo orden persiste.
  - [ ] Al eliminar una imagen + guardar, desaparece del bucket (verificar en Supabase Dashboard → Storage → products).
- [ ] Probar flujo "Descartar" con producto nuevo: las imágenes subidas en esa sesión se borran del bucket al cancelar.

## ⚠️ Notas importantes

1. **Bug pre-existente no tocado:** `handleSave` sigue borrando + reinsertando variantes en cada edición (esto cambia los IDs de variantes). Es deuda técnica conocida, no se toca en esta sesión para no romper nada.
2. **Progreso de upload simulado:** El cliente JS de Supabase no emite progreso real de upload. La barra va de 10% → 50% → 100%. Si en el futuro querés progreso real, hay que usar fetch directo al endpoint de Storage.
3. **Políticas RLS:** Asumimos que el bucket `products` ya tiene políticas de escritura para `authenticated` (según `supabase-schema.sql`). Si al subir tirás error "new row violates row-level security policy", hay que revisar las policies del bucket en Supabase Dashboard.
