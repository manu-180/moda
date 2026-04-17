'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import type { Order } from '@/types'
import { formatPrice, formatDate, cn } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import { ORDER_STATUSES } from '@/lib/constants'

const STATUSES = ['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const

const STATUS_VARIANT: Record<string, 'default' | 'new' | 'sale' | 'success' | 'warning'> = {
  pending: 'warning', confirmed: 'new', shipped: 'default', delivered: 'success', cancelled: 'sale',
}

interface Props { initialOrders: Order[] }

export default function AdminOrdersList({ initialOrders }: Props) {
  const [search, setSearch] = useState('')
  const [activeStatus, setActiveStatus] = useState<string>('all')
  const [page, setPage] = useState(1)
  const perPage = 15

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: initialOrders.length }
    initialOrders.forEach((o) => { counts[o.status] = (counts[o.status] || 0) + 1 })
    return counts
  }, [initialOrders])

  const filtered = useMemo(() => {
    let result = [...initialOrders]
    if (activeStatus !== 'all') result = result.filter((o) => o.status === activeStatus)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((o) =>
        o.order_number?.toLowerCase().includes(q) ||
        o.customer_email?.toLowerCase().includes(q) ||
        o.customer_name?.toLowerCase().includes(q)
      )
    }
    return result
  }, [initialOrders, activeStatus, search])

  const totalPages = Math.ceil(filtered.length / perPage)
  const visible = filtered.slice((page - 1) * perPage, page * perPage)

  return (
    <div>
      {/* Search */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center border border-pale-gray px-3 py-2 gap-2 bg-white rounded flex-1 max-w-[320px]">
          <Search className="h-4 w-4 text-warm-gray" strokeWidth={1.5} />
          <input type="text" placeholder="Buscar por nº de pedido, nombre o correo…"
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="font-body text-[13px] text-charcoal bg-transparent border-none outline-none w-full placeholder:text-warm-gray" />
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-6 border-b border-pale-gray mb-6 overflow-x-auto">
        {STATUSES.map((s) => (
          <button key={s}
            onClick={() => { setActiveStatus(s); setPage(1) }}
            className={cn(
              'pb-3 font-body text-[12px] uppercase tracking-[0.08em] whitespace-nowrap transition-colors border-b-[1.5px] -mb-[1px]',
              activeStatus === s
                ? 'text-charcoal border-champagne'
                : 'text-warm-gray border-transparent hover:text-dark-gray'
            )}>
            {s === 'all' ? 'Todos' : (ORDER_STATUSES as Record<string, { label: string }>)[s]?.label ?? s}
            {statusCounts[s] ? ` (${statusCounts[s]})` : ''}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-pale-gray rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-pale-gray">
                {['Pedido', 'Cliente', 'Fecha', 'Ítems', 'Total', 'Estado'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left font-body text-[11px] uppercase tracking-[0.08em] text-warm-gray font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((order) => (
                <tr key={order.id} className="border-b border-pale-gray last:border-0 hover:bg-ivory transition-colors">
                  <td className="px-5 py-4">
                    <Link href={`/admin/orders/${order.id}`}
                      className="font-body text-[13px] text-charcoal font-medium hover:underline">
                      {order.order_number}
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-body text-[13px] text-charcoal">{order.customer_name}</p>
                    <p className="font-body text-[11px] text-warm-gray">{order.customer_email}</p>
                  </td>
                  <td className="px-5 py-4 font-body text-[13px] text-warm-gray">{formatDate(order.created_at)}</td>
                  <td className="px-5 py-4 font-body text-[13px] text-dark-gray">{order.items?.length || 0}</td>
                  <td className="px-5 py-4 font-body text-[13px] text-charcoal font-medium">{formatPrice(order.total)}</td>
                  <td className="px-5 py-4">
                    <Badge variant={STATUS_VARIANT[order.status] || 'default'}>
                      {(ORDER_STATUSES as Record<string, { label: string }>)[order.status]?.label ?? order.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-pale-gray flex items-center justify-between">
            <span className="font-body text-[12px] text-warm-gray">
              Mostrando {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} de {filtered.length}
            </span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 font-body text-[12px] border border-pale-gray text-dark-gray hover:border-charcoal disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                Anterior
              </button>
              <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 font-body text-[12px] border border-pale-gray text-dark-gray hover:border-charcoal disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
