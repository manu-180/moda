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
    <section className="relative bg-charcoal min-h-[50vh] flex items-center justify-center px-6 py-20 md:py-28 overflow-hidden">
      <Image
        src={editorialImages.newsletter}
        alt=""
        fill
        className="object-cover object-center opacity-[0.28]"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-charcoal/86" />
      <div className="relative z-10 max-w-[600px] w-full flex flex-col items-center text-center">
        {/* Gold line */}
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
          className="font-display italic text-white text-[32px] md:text-[48px] leading-[1.15]"
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
              className="md:ml-8 border border-white/50 text-white font-body text-[10px] uppercase tracking-[0.2em] px-8 py-3 transition-all duration-[500ms] ease-luxury hover:bg-white hover:text-charcoal hover:border-white shrink-0"
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
