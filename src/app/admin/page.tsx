import { createClient } from '@/lib/supabase/server'
import type { Order } from '@/types'
import StatsCard from '@/components/admin/StatsCard'
import RevenueChart from '@/components/admin/RevenueChart'
import OrdersDonut from '@/components/admin/OrdersDonut'
import TopProducts from '@/components/admin/TopProducts'
import DataTable from '@/components/admin/DataTable'

async function getDashboardData() {
  const supabase = createClient()

  // Orders with items
  const { data: orders } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .order('created_at', { ascending: false })

  const allOrders = (orders as Order[]) || []

  // Stats
  const totalRevenue = allOrders.reduce((s, o) => s + (o.total || 0), 0)
  const orderCount = allOrders.length
  const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0

  // Orders by status
  const statusColors: Record<string, string> = {
    pending: '#8A8A8A',
    confirmed: '#C4A265',
    shipped: '#1A1A1A',
    delivered: '#2D5016',
    cancelled: '#9B1B30',
  }
  const statusCounts = allOrders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1
    return acc
  }, {})
  const donutData = Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count,
    color: statusColors[status] || '#8A8A8A',
  }))

  // Top products by revenue from order items
  const productMap = new Map<string, { name: string; units_sold: number; revenue: number }>()
  allOrders.forEach((o) =>
    o.items?.forEach((item) => {
      const existing = productMap.get(item.product_name) || { name: item.product_name, units_sold: 0, revenue: 0 }
      existing.units_sold += item.quantity
      existing.revenue += item.unit_price * item.quantity
      productMap.set(item.product_name, existing)
    })
  )
  const topProducts = Array.from(productMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  // Revenue chart data: últimos 14 días con ingresos reales (0 si no hubo ventas ese día)
  const chartData = Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (13 - i))
    const dayOrders = allOrders.filter((o) => {
      const od = new Date(o.created_at)
      return od.toDateString() === d.toDateString()
    })
    return {
      date: d.toLocaleDateString('es-AR', { month: 'short', day: 'numeric' }),
      revenue: dayOrders.reduce((s, o) => s + (o.total || 0), 0),
    }
  })

  return {
    totalRevenue,
    orderCount,
    avgOrderValue,
    donutData,
    topProducts,
    chartData,
    recentOrders: allOrders.slice(0, 10),
    totalOrderCount: allOrders.length,
  }
}

export default async function AdminDashboard() {
  const data = await getDashboardData()

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard label="Ingresos totales" value={`$${Math.round(data.totalRevenue).toLocaleString('es-AR')}`} icon="DollarSign" accentColor="#C4A265" index={0} />
        <StatsCard label="Pedidos" value={String(data.orderCount)} icon="ShoppingBag" accentColor="#1A1A1A" index={1} />
        <StatsCard label="Ticket promedio" value={`$${Math.round(data.avgOrderValue)}`} icon="BarChart3" accentColor="#2D5016" index={2} />
      </div>

      {/* Revenue chart */}
      <RevenueChart data={data.chartData} />

      {/* Donut + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <OrdersDonut data={data.donutData} />
        <TopProducts products={data.topProducts} />
      </div>

      {/* Recent orders */}
      <DataTable orders={data.recentOrders} total={data.totalOrderCount} />
    </div>
  )
}
