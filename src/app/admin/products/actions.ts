'use server'

import { createAdminClient } from '@/lib/supabase/admin'

interface VariantPayload {
  id?: string
  size: string
  color: string
  color_hex: string
  stock: number
  sku: string
}

interface ImagePayload {
  url: string
}

interface SaveProductPayload {
  productId?: string
  productData: {
    name: string
    slug: string
    description: string
    price: number
    compare_at_price: number | null
    category_id: string | null
    collection_id: string | null
    status: string
    is_featured: boolean
    is_new: boolean
  }
  variants: VariantPayload[]
  images: ImagePayload[]
  originalVariantIds: string[]
  isNew: boolean
}

export async function saveProductAction(
  payload: SaveProductPayload
): Promise<{ productId: string } | { error: string }> {
  const supabase = createAdminClient()
  const { productData, variants, images, originalVariantIds, isNew } = payload
  let { productId } = payload

  try {
    // 1) Upsert product
    if (isNew) {
      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single()
      if (error) throw error
      productId = data.id
    } else {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', productId)
      if (error) throw error
    }

    // 2) Variant diff
    const currentIdsInForm = new Set(
      variants.filter((v) => v.id).map((v) => v.id as string)
    )
    const deletedVariantIds = originalVariantIds.filter(
      (id) => !currentIdsInForm.has(id)
    )

    const defaultSku = (v: VariantPayload) =>
      v.sku ||
      `ME-${productData.slug.toUpperCase().slice(0, 4)}-${v.size}-${v.color.slice(0, 3).toUpperCase()}`

    if (deletedVariantIds.length > 0) {
      const { error } = await supabase
        .from('product_variants')
        .update({ is_active: false })
        .in('id', deletedVariantIds)
      if (error) throw error
    }

    for (const v of variants.filter((v) => v.id)) {
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

    const toInsert = variants
      .filter((v) => !v.id)
      .map((v) => ({
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

    // 3) Image diff
    if (!isNew) {
      await supabase.from('product_images').delete().eq('product_id', productId)
    }
    if (images.length > 0) {
      const imageRows = images.map((img, index) => ({
        product_id: productId,
        url: img.url,
        alt: productData.name,
        position: index,
      }))
      const { error } = await supabase.from('product_images').insert(imageRows)
      if (error) throw error
    }

    return { productId: productId! }
  } catch (err) {
    const message =
      err && typeof err === 'object' && 'message' in err
        ? String((err as { message: unknown }).message)
        : 'Error desconocido al guardar'
    return { error: message }
  }
}
