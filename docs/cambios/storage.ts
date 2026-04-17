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

export function extractStoragePath(publicUrl: string): string | null {
  const marker = `/storage/v1/object/public/${BUCKET}/`
  const idx = publicUrl.indexOf(marker)
  if (idx === -1) return null
  return publicUrl.slice(idx + marker.length)
}

export async function deleteProductImage(urlOrPath: string): Promise<void> {
  const path = urlOrPath.startsWith('http') ? extractStoragePath(urlOrPath) : urlOrPath
  if (!path) return

  const supabase = createClient()
  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) {
    throw new StorageError(`No se pudo eliminar la imagen: ${error.message}`, 'delete')
  }
}
