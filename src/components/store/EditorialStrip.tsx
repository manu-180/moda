'use client'

import { motion } from 'framer-motion'
import { useSiteConfig } from '@/lib/site-config-context'

const ease = [0.25, 0.1, 0.25, 1] as const

export default function EditorialStrip() {
  const { editorial_strip } = useSiteConfig()

  return (
    <section className="py-20 md:py-[120px] bg-white px-6">
      <div className="max-w-[800px] mx-auto flex flex-col items-center text-center">
        {/* Gold decorative line */}
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: 60 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 1, ease }}
          className="h-[1px] bg-champagne mb-10"
        />

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 1, ease }}
          className="font-display italic text-charcoal text-[28px] md:text-[42px] leading-[1.3]"
        >
          {editorial_strip.title}
        </motion.h2>

        {editorial_strip.subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: 0.2, duration: 1, ease }}
            className="font-body text-[14px] md:text-[15px] font-light text-warm-gray leading-relaxed mt-7 max-w-[600px]"
          >
            {editorial_strip.subtitle}
          </motion.p>
        )}
      </div>
    </section>
  )
}
