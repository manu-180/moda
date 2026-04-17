'use client'

import { motion } from 'framer-motion'

const EXPO = [0.76, 0, 0.24, 1] as const
const EASE = [0.25, 0.1, 0.25, 1] as const

export default function StoreTemplate({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Cream curtain — wipes in from top, reveals page */}
      <motion.div
        className="fixed inset-0 z-[200] bg-cream pointer-events-none origin-top"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        transition={{ duration: 0.7, ease: EXPO }}
      />

      {/* Page content — fades in after curtain lifts */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.5 }}
      >
        {children}
      </motion.div>
    </>
  )
}
