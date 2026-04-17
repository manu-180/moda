'use client'

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { formatPrice } from '@/lib/utils'

interface RevenueChartProps {
  data: { date: string; revenue: number }[]
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-charcoal text-white px-4 py-2.5 font-body text-[12px]">
      <p className="text-white/60 mb-0.5">{label}</p>
      <p className="font-medium">{formatPrice(payload[0].value)}</p>
    </div>
  )
}

export default function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="bg-white border border-pale-gray rounded-lg p-6">
      <h3 className="font-body text-[12px] uppercase tracking-[0.08em] text-warm-gray mb-6">
        Ingresos
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C4A265" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#C4A265" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DF" vertical={false} />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#8A8A8A', fontFamily: 'Inter' }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#8A8A8A', fontFamily: 'Inter' }}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            dx={-10}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#C4A265"
            strokeWidth={2}
            fill="url(#revenueGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
