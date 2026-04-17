'use client'

import { useState, useRef, useEffect, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Tab {
  id: string
  label: string
  content: ReactNode
}

interface TabsProps {
  tabs: Tab[]
  defaultTab?: string
  onChange?: (tabId: string) => void
  className?: string
}

export default function Tabs({
  tabs,
  defaultTab,
  onChange,
  className,
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map())
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = tabRefs.current.get(activeTab)
    if (el && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect()
      const tabRect = el.getBoundingClientRect()
      setIndicatorStyle({
        left: tabRect.left - containerRect.left,
        width: tabRect.width,
      })
    }
  }, [activeTab])

  function handleTabClick(tabId: string) {
    setActiveTab(tabId)
    onChange?.(tabId)
  }

  const activeContent = tabs.find((t) => t.id === activeTab)?.content

  return (
    <div className={className}>
      {/* Tab buttons */}
      <div ref={containerRef} className="relative border-b border-pale-gray">
        <div className="flex gap-8" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              ref={(el) => {
                if (el) tabRefs.current.set(tab.id, el)
              }}
              onClick={() => handleTabClick(tab.id)}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`tabpanel-${tab.id}`}
              className={cn(
                'pb-3 font-body text-[12px] uppercase tracking-[0.12em] transition-colors duration-300 ease-luxury focus:outline-none',
                activeTab === tab.id ? 'text-charcoal' : 'text-warm-gray hover:text-dark-gray'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sliding indicator */}
        <motion.div
          className="absolute bottom-0 h-[1.5px] bg-charcoal"
          animate={{ left: indicatorStyle.left, width: indicatorStyle.width }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
        />
      </div>

      {/* Tab content */}
      <div
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        className="pt-6"
      >
        {activeContent}
      </div>
    </div>
  )
}
