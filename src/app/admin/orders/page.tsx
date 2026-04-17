import { createClient } from '@/lib/supabase/server'
import type { Order } from '@/types'
import AdminOrdersList from '@/components/admin/AdminOrdersList'

async function getData() {
  const supabase = createClient()
  const { data } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .order('created_at', { ascending: false })

  return (data as Order[]) || []
}

export default async function AdminOrdersPage() {
  const orders = await getData()
  return <AdminOrdersList initialOrders={orders} />
}
