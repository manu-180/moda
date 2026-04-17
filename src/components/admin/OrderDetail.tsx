'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/Toast'
import type { Order, Address } from '@/types'
import { formatPrice, formatDate, cn } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import { ORDER_STATUSES } from '@/lib/constants'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'

const STATUS_VARIANT: Record<string, 'default' | 'new' | 'sale' | 'success' | 'warning'> = {
  pending: 'warning', confirmed: 'new', shipped: 'default', delivered: 'success', cancelled: 'sale',
}

const STATUS_FLOW = ['pending', 'confirmed', 'shipped', 'delivered'] as const

const TIMELINE_LABELS: Record<string, string> = {
  pending: 'Pedido recibido',
  confirmed: 'Pago confirmado',
  shipped: 'Pedido enviado',
  delivered: 'Pedido entregado',
  cancelled: 'Pedido cancelado',
}

interface Props { initialOrder: Order }

export default function OrderDetail({ initialOrder }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [order, setOrder] = useState(initialOrder)
  const [notes, setNotes] = useState((order as Order & { notes?: string }).notes || '')
  const [savingNotes, setSavingNotes] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const address = order.shipping_address as Address | null
  const currentIdx = STATUS_FLOW.indexOf(order.status as typeof STATUS_FLOW[number])
  const nextStatus = currentIdx >= 0 && currentIdx < STATUS_FLOW.length - 1
    ? STATUS_FLOW[currentIdx + 1] : null

  async function handleStatusUpdate(newStatus: string) {
    setUpdatingStatus(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', order.id)
      if (error) throw error
      setOrder((prev) => ({ ...prev, status: newStatus as Order['status'] }))
      toast('Estado actualizado', 'success')
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Error al actualizar estado', 'error')
    } finally {
      setUpdatingStatus(false)
    }
  }

  async function handleSaveNotes() {
    setSavingNotes(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('orders').update({ notes }).eq('id', order.id)
      if (error) throw error
      toast('Nota guardada', 'success')
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Error al guardar nota', 'error')
    } finally {
      setSavingNotes(false)
    }
  }

  // Build timeline from status flow
  const timeline: { status: Order['status']; label: string; completed: boolean }[] =
    STATUS_FLOW.slice(0, currentIdx + 1).map((s) => ({
      status: s as Order['status'],
      label: TIMELINE_LABELS[s] ?? s,
      completed: true,
    }))
  if (order.status === 'cancelled') {
    timeline.push({ status: 'cancelled', label: TIMELINE_LABELS.cancelled, completed: true })
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left — 65% */}
      <div className="flex-1 space-y-6">
        {/* Header */}
        <div className="bg-white border border-pale-gray rounded-lg p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <h2 className="font-body text-[20px] text-charcoal">Pedido {order.order_number}</h2>
              <Badge variant={STATUS_VARIANT[order.status] || 'default'}>
                {(ORDER_STATUSES as Record<string, { label: string }>)[order.status]?.label ?? order.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {nextStatus && (
                <Button size="sm" loading={updatingStatus}
                  onClick={() => handleStatusUpdate(nextStatus)}>
                  Marcar como {(ORDER_STATUSES as Record<string, { label: string }>)[nextStatus]?.label?.toLowerCase() ?? nextStatus}
                </Button>
              )}
              {order.status !== 'delivered' && order.status !== 'cancelled' && (
                <Button size="sm" variant="danger"
                  onClick={() => handleStatusUpdate('cancelled')}>
                  Cancelar pedido
                </Button>
              )}
            </div>
          </div>
          <p className="font-body text-[13px] text-warm-gray">
            {formatDate(order.created_at, { hour: 'numeric', minute: '2-digit' })}
          </p>
        </div>

        {/* Items */}
        <div className="bg-white border border-pale-gray rounded-lg p-6">
          <h3 className="font-body text-[12px] uppercase tracking-[0.08em] text-warm-gray mb-5">Ítems</h3>
          <div className="divide-y divide-pale-gray">
            {order.items?.map((item) => (
              <div key={item.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                <div className="h-[60px] w-[48px] bg-cream rounded shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-body text-[13px] text-charcoal">{item.product_name}</p>
                  <p className="font-body text-[11px] text-warm-gray">
                    {item.variant_color} / {item.variant_size} × {item.quantity}
                  </p>
                </div>
                <span className="font-body text-[13px] text-charcoal shrink-0">
                  {formatPrice(item.unit_price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-pale-gray mt-4 pt-4 space-y-2">
            <div className="flex justify-between font-body text-[13px]">
              <span className="text-warm-gray">Subtotal</span>
              <span className="text-charcoal">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between font-body text-[13px]">
              <span className="text-warm-gray">Envío</span>
              <span className={cn(order.shipping === 0 && 'text-deep-forest')}>
                {order.shipping === 0 ? 'Bonificado' : formatPrice(order.shipping)}
              </span>
            </div>
            <div className="flex justify-between font-body text-[13px]">
              <span className="text-warm-gray">Impuestos</span>
              <span>{formatPrice(order.tax)}</span>
            </div>
            <div className="flex justify-between font-body text-[14px] font-medium pt-2 border-t border-pale-gray">
              <span className="text-charcoal">Total</span>
              <span className="text-charcoal">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white border border-pale-gray rounded-lg p-6">
          <h3 className="font-body text-[12px] uppercase tracking-[0.08em] text-warm-gray mb-5">Historial</h3>
          <div className="flex flex-col gap-0">
            {timeline.map((event, i) => (
              <div key={event.status} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    'h-3 w-3 rounded-full border-2 shrink-0',
                    event.status === 'cancelled'
                      ? 'border-muted-red bg-muted-red'
                      : 'border-charcoal bg-charcoal'
                  )} />
                  {i < timeline.length - 1 && <div className="w-[1px] h-8 bg-pale-gray" />}
                </div>
                <div className="pb-6">
                  <p className="font-body text-[13px] text-charcoal">{event.label}</p>
                  <p className="font-body text-[11px] text-warm-gray">{formatDate(order.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — 35% */}
      <div className="w-full lg:w-[35%] space-y-6">
        {/* Customer */}
        <div className="bg-white border border-pale-gray rounded-lg p-6">
          <h3 className="font-body text-[12px] uppercase tracking-[0.08em] text-warm-gray mb-4">Cliente</h3>
          <p className="font-body text-[14px] text-charcoal">{order.customer_name}</p>
          <p className="font-body text-[13px] text-warm-gray mt-1">{order.customer_email}</p>
        </div>

        {/* Shipping */}
        {address && (
          <div className="bg-white border border-pale-gray rounded-lg p-6">
            <h3 className="font-body text-[12px] uppercase tracking-[0.08em] text-warm-gray mb-4">Dirección de envío</h3>
            <div className="font-body text-[13px] text-dark-gray leading-[1.7]">
              <p>{address.line1}</p>
              {address.line2 && <p>{address.line2}</p>}
              <p>{address.city}, {address.state} {address.postal_code}</p>
              <p>{address.country}</p>
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="bg-white border border-pale-gray rounded-lg p-6">
          <h3 className="font-body text-[12px] uppercase tracking-[0.08em] text-warm-gray mb-4">Notas</h3>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notas internas…"
            id="order-notes"
            autoResize
          />
          <div className="mt-3">
            <Button size="sm" variant="secondary" loading={savingNotes} onClick={handleSaveNotes}>
              Guardar nota
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
