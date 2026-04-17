import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Order } from '@/types'
import OrderDetail from '@/components/admin/OrderDetail'

interface PageProps { params: { id: string } }

async function getOrder(id: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('id', id)
    .single()
  return data as Order | null
}

export default async function OrderDetailPage({ params }: PageProps) {
  const order = await getOrder(params.id)
  if (!order) notFound()
  return <OrderDetail initialOrder={order} />
}
