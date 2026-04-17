'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { editorialImages } from '@/lib/editorial-images'
import { useSiteConfig } from '@/lib/site-config-context'

const ease = [0.25, 0.1, 0.25, 1] as const

export default function NewsletterCTA() {
  const { newsletter } = useSiteConfig()
  const [email, setEmail] = useState('')

  return (
    <section
      className="relative min-h-[60vh] flex items-center justify-center px-6 py-24 md:py-36 overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #130d09 0%, #1e1410 45%, #160d10 100%)' }}
    >
      <Image
        src={editorialImages.newsletter}
        alt=""
        fill
        className="object-cover object-center opacity-[0.18]"
        sizes="100vw"
      />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(145deg, rgba(19,13,9,0.92) 0%, rgba(30,20,16,0.85) 50%, rgba(22,13,16,0.92) 100%)' }} />

      {/* Decorative circle — top right */}
      <div
        className="absolute -top-[15%] -right-[10%] w-[55vw] h-[55vw] max-w-[520px] max-h-[520px] rounded-full pointer-events-none"
        style={{ border: '1px solid rgba(196,162,101,0.12)' }}
      />
      {/* Decorative circle — bottom left */}
      <div
        className="absolute -bottom-[15%] -left-[8%] w-[40vw] h-[40vw] max-w-[380px] max-h-[380px] rounded-full pointer-events-none"
        style={{ border: '1px solid rgba(196,162,101,0.09)' }}
      />

      {/* Decorative rotating SVG ornament — far right (desktop only) */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.07 }}
        viewport={{ once: true }}
        transition={{ duration: 2 }}
        className="absolute right-[4%] top-1/2 -translate-y-1/2 pointer-events-none hidden xl:block"
        style={{ animation: 'rotateSlow 60s linear infinite' }}
      >
        <svg width="260" height="260" viewBox="0 0 260 260" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="130" cy="50" rx="28" ry="82" stroke="#C4A265" strokeWidth="0.7" />
          <ellipse cx="130" cy="50" rx="28" ry="82" stroke="#C4A265" strokeWidth="0.7" transform="rotate(45 130 130)" />
          <ellipse cx="130" cy="50" rx="28" ry="82" stroke="#C4A265" strokeWidth="0.7" transform="rotate(90 130 130)" />
          <ellipse cx="130" cy="50" rx="28" ry="82" stroke="#C4A265" strokeWidth="0.7" transform="rotate(135 130 130)" />
          <circle cx="130" cy="130" r="22" stroke="#C4A265" strokeWidth="0.7" />
          <circle cx="130" cy="130" r="9" stroke="#C4A265" strokeWidth="0.7" />
        </svg>
      </motion.div>

      <div className="relative z-10 max-w-[600px] w-full flex flex-col items-center text-center">
        {/* Gold line — longer */}
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: 80 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 1.2, ease }}
          className="h-[1px] mb-8"
          style={{ background: 'var(--color-brand-primary)' }}
        />

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 0.55, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.1, duration: 0.8, ease }}
          className="font-body text-[10px] uppercase tracking-[0.28em] text-white mb-5"
        >
          Comunidad privada
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 1, ease }}
          className="font-display italic text-white text-[32px] md:text-[52px] leading-[1.1]"
        >
          {newsletter.title}
        </motion.h2>

        {newsletter.subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: 0.2, duration: 0.8, ease }}
            className="font-body text-[13px] font-light text-white/50 leading-[1.8] mt-6 max-w-[420px] tracking-wide"
          >
            {newsletter.subtitle}
          </motion.p>
        )}

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.4, duration: 0.8, ease }}
          className="w-full mt-12"
        >
          <div className="flex flex-col md:flex-row items-stretch gap-4 md:gap-0 max-w-[480px] mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Tu correo electrónico"
              className="flex-1 bg-transparent border-b border-white/20 pb-3 font-body text-[13px] text-white placeholder:text-white/30 focus:outline-none focus:border-white/60 transition-colors duration-300 tracking-wide"
            />
            <button
              onClick={() => setEmail('')}
              className="md:ml-8 text-white font-body text-[10px] uppercase tracking-[0.2em] px-8 py-3 shrink-0 transition-all duration-[500ms] ease-luxury"
              style={{ background: 'var(--color-brand-primary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-brand-accent)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-brand-primary)' }}
            >
              Unirme
            </button>
          </div>
          <p className="font-body text-[10px] text-white/20 mt-6 tracking-wide">
            Al suscribirte, aceptás nuestra política de privacidad.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
