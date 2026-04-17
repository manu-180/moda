export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  compare_at_price?: number
  category_id: string
  collection_id?: string
  images: ProductImage[]
  variants: ProductVariant[]
  is_featured: boolean
  is_new: boolean
  status: 'active' | 'draft' | 'archived'
  created_at: string
  updated_at: string
}

export interface ProductImage {
  id: string
  product_id: string
  url: string
  alt: string
  position: number
}

export interface ProductVariant {
  id: string
  product_id: string
  size: string
  color: string
  color_hex: string
  stock: number
  sku: string
  is_active?: boolean
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image_url?: string
  parent_id?: string
  position: number
}

export interface Collection {
  id: string
  name: string
  slug: string
  description?: string
  image_url?: string
  is_active: boolean
  season?: string
}

export interface Order {
  id: string
  order_number: string
  customer_email: string
  customer_name: string
  items: OrderItem[]
  subtotal: number
  shipping: number
  tax: number
  total: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  shipping_address: Address
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  variant_id?: string
  product_name: string
  variant_size: string
  variant_color: string
  quantity: number
  unit_price: number
}

export interface Address {
  line1: string
  line2?: string
  city: string
  state: string
  postal_code: string
  country: string
}

export interface CartItem {
  product: Product
  variant: ProductVariant
  quantity: number
}
