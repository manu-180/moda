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
  id: string
  url: string
  dbId?: string
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
  progress: number
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

  const imagesRef = useRef(images)
  imagesRef.current = images

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files)
      if (fileArray.length === 0) return

      const uploadingEntries: UploadingFile[] = fileArray.map((f) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: f.name,
        progress: 10,
      }))
      setUploading((prev) => [...prev, ...uploadingEntries])

      await Promise.all(
        fileArray.map(async (file, idx) => {
          const entryId = uploadingEntries[idx].id
          try {
            setUploading((prev) =>
              prev.map((u) => (u.id === entryId ? { ...u, progress: 50 } : u))
            )
            const result = await uploadProductImage(file, productSlug)
            setUploading((prev) =>
              prev.map((u) => (u.id === entryId ? { ...u, progress: 100 } : u))
            )
            const newImage: UploaderImage = {
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              url: result.url,
            }
            onChange([...imagesRef.current, newImage])
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
    e.target.value = ''
  }

  const handleRemove = async (image: UploaderImage) => {
    onChange(images.filter((i) => i.id !== image.id))
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

      {isPrimary && (
        <div className="absolute top-2 left-2 bg-charcoal text-ivory px-2 py-1 rounded flex items-center gap-1">
          <Star className="h-2.5 w-2.5 fill-current" />
          <span className="font-body text-[9px] uppercase tracking-[0.08em]">Principal</span>
        </div>
      )}

      <button
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-1.5 rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Reordenar imagen"
      >
        <GripVertical className="h-3.5 w-3.5 text-charcoal" />
      </button>

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
