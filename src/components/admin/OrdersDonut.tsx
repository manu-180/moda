'use client'

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { ORDER_STATUSES } from '@/lib/constants'

interface StatusCount {
  status: string
  count: number
  color: string
}

interface OrdersDonutProps {
  data: StatusCount[]
}

export default function OrdersDonut({ data }: OrdersDonutProps) {
  const total = data.reduce((s, d) => s + d.count, 0)

  return (
    <div className="bg-white border border-pale-gray rounded-lg p-6">
      <h3 className="font-body text-[12px] uppercase tracking-[0.08em] text-warm-gray mb-6">
        Pedidos por estado
      </h3>
      <div className="flex flex-col items-center">
        <div className="relative w-[200px] h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                dataKey="count"
                strokeWidth={0}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-body text-[28px] font-semibold text-charcoal">{total}</span>
            <span className="font-body text-[10px] uppercase text-warm-gray tracking-[0.08em]">Pedidos</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-6">
          {data.map((d) => (
            <div key={d.status} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
              <span className="font-body text-[12px] text-dark-gray">
                {(ORDER_STATUSES as Record<string, { label: string }>)[d.status]?.label ?? d.status} ({d.count})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
