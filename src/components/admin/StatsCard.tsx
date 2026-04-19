'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, BarChart3, Package, Users, Tag, Layers, AlertCircle, PackageX } from 'lucide-react'
import { cn } from '@/lib/utils'

const iconMap = {
  DollarSign,
  ShoppingBag,
  BarChart3,
  Package,
  Users,
  Tag,
  Layers,
  AlertCircle,
  PackageX,
} as const

export type StatsIconName = keyof typeof iconMap

interface StatsCardProps {
  label: string
  value: string
  trend?: number
  icon: StatsIconName
  accentColor?: string
  index?: number
}

const ease = [0.25, 0.1, 0.25, 1] as const

export default function StatsCard({ label, value, trend, icon, accentColor = '#C4A265', index = 0 }: StatsCardProps) {
  const Icon = iconMap[icon]
  // Animate number from 0
  const numericValue = parseFloat(value.replace(/[^0-9.]/g, ''))
  const prefix = value.match(/^[^0-9]*/)?.[0] || ''
  const suffix = value.match(/[^0-9.]*$/)?.[0] || ''
  const [displayNum, setDisplayNum] = useState(0)

  useEffect(() => {
    const duration = 1000
    const start = performance.now()
    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayNum(Math.round(numericValue * eased * 100) / 100)
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [numericValue])

  const formattedNum = Number.isInteger(numericValue)
    ? Math.round(displayNum).toLocaleString()
    : displayNum.toFixed(1)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease }}
      className="bg-white border border-pale-gray rounded-lg p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="h-10 w-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${accentColor}18` }}
        >
          <Icon className="h-5 w-5" strokeWidth={1.5} style={{ color: accentColor }} />
        </div>
        {trend !== undefined && (
          <div className={cn(
            'flex items-center gap-1 font-body text-[12px] font-medium',
            trend >= 0 ? 'text-deep-forest' : 'text-muted-red'
          )}>
            {trend >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {trend >= 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
      <p className="font-body text-[28px] font-semibold text-charcoal leading-none mb-1">
        {prefix}{formattedNum}{suffix}
      </p>
      <p className="font-body text-[12px] uppercase tracking-[0.08em] text-warm-gray">
        {label}
      </p>
    </motion.div>
  )
}
