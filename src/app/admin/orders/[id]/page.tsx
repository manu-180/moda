import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Order } from '@/types'
import OrderDetail from '@/components/admin/OrderDetail'

interface PageProps { params: Promise<{ id: string }> }

async function getOrder(id: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('id', id)
    .single()
  return data as Order | null
}

export default async function OrderDetailPage(props: PageProps) {
  const params = await props.params;
  const order = await getOrder(params.id)
  if (!order) notFound()
  return <OrderDetail initialOrder={order} />
}
