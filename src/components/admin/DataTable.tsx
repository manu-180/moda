'use client'

import { useRouter } from 'next/navigation'
import { formatPrice, formatDate, cn } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import { ORDER_STATUSES } from '@/lib/constants'
import type { Order } from '@/types'

const STATUS_VARIANT: Record<string, 'default' | 'new' | 'sale' | 'success' | 'warning'> = {
  pending: 'warning',
  confirmed: 'new',
  shipped: 'default',
  delivered: 'success',
  cancelled: 'sale',
}

interface DataTableProps {
  orders: Order[]
  total?: number
  page?: number
  perPage?: number
  onPageChange?: (page: number) => void
}

export default function DataTable({ orders, total = 0, page = 1, perPage = 10, onPageChange }: DataTableProps) {
  const router = useRouter()
  const totalPages = Math.ceil(total / perPage)

  return (
    <div className="bg-white border border-pale-gray rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-pale-gray">
        <h3 className="font-body text-[12px] uppercase tracking-[0.08em] text-warm-gray">
          Pedidos recientes
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-pale-gray">
              {['Pedido', 'Cliente', 'Ítems', 'Total', 'Estado', 'Fecha'].map((h) => (
                <th key={h} className="px-6 py-3 text-left font-body text-[11px] uppercase tracking-[0.08em] text-warm-gray font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                onClick={() => router.push(`/admin/orders/${order.id}`)}
                className="border-b border-pale-gray last:border-0 hover:bg-ivory transition-colors duration-150 cursor-pointer"
              >
                <td className="px-6 py-4 font-body text-[13px] text-charcoal font-medium">
                  {order.order_number}
                </td>
                <td className="px-6 py-4 font-body text-[13px] text-dark-gray">
                  {order.customer_name}
                </td>
                <td className="px-6 py-4 font-body text-[13px] text-dark-gray">
                  {order.items?.length || 0}
                </td>
                <td className="px-6 py-4 font-body text-[13px] text-charcoal font-medium">
                  {formatPrice(order.total)}
                </td>
                <td className="px-6 py-4">
                  <Badge variant={STATUS_VARIANT[order.status] || 'default'}>
                    {(ORDER_STATUSES as Record<string, { label: string }>)[order.status]?.label ?? order.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 font-body text-[13px] text-warm-gray">
                  {formatDate(order.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > perPage && (
        <div className="px-6 py-3 border-t border-pale-gray flex items-center justify-between">
          <span className="font-body text-[12px] text-warm-gray">
            Mostrando {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} de {total}
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => onPageChange?.(page - 1)}
              className="px-3 py-1.5 font-body text-[12px] border border-pale-gray text-dark-gray hover:border-charcoal disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => onPageChange?.(page + 1)}
              className="px-3 py-1.5 font-body text-[12px] border border-pale-gray text-dark-gray hover:border-charcoal disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
