'use client'

import { motion } from 'framer-motion'

const ease = [0.25, 0.1, 0.25, 1] as const

const LOGOS = [
  { name: 'VOGUE', className: 'font-display text-[24px] md:text-[28px] uppercase tracking-[0.1em]' },
  { name: 'ELLE', className: 'font-body text-[24px] md:text-[28px] uppercase tracking-[0.3em] font-semibold' },
  { name: "HARPER'S BAZAAR", className: 'font-display text-[16px] md:text-[20px] uppercase tracking-[0.15em]' },
  { name: 'W MAGAZINE', className: 'font-body text-[20px] md:text-[24px] uppercase tracking-[0.2em] font-light' },
  { name: "L'OFFICIEL", className: 'font-display text-[18px] md:text-[22px] uppercase tracking-[0.12em]' },
]

export default function PressStrip() {
  return (
    <section className="bg-cream py-12 md:py-20 px-6">
      <div className="max-w-[1200px] mx-auto">
        {/* Label */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease }}
          className="font-body text-[10px] uppercase tracking-[0.2em] text-warm-gray text-center mb-10 md:mb-14"
        >
          Como en
        </motion.p>

        {/* Logos */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-6 md:gap-x-[60px]">
          {LOGOS.map((logo, i) => (
            <motion.span
              key={logo.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ delay: i * 0.1, duration: 0.6, ease }}
              className={`${logo.className} text-warm-gray select-none`}
            >
              {logo.name}
            </motion.span>
          ))}
        </div>

        {/* Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.6, duration: 0.8, ease }}
          className="mt-14 md:mt-20 text-center"
        >
          <blockquote className="font-display italic text-charcoal text-[18px] md:text-[22px] leading-[1.5] max-w-[700px] mx-auto">
            &ldquo;Maison Élara representa una nueva ola de lujo sudamericano
            — donde el oficio europeo encuentra el alma latinoamericana.&rdquo;
          </blockquote>
          <p className="font-body text-[11px] uppercase tracking-[0.1em] text-warm-gray mt-5">
            — Vogue, marzo 2026
          </p>
        </motion.div>
      </div>
    </section>
  )
}
