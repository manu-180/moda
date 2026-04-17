'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'

type FormState = 'idle' | 'sending' | 'success' | 'error'

export default function ContactForm() {
  const [state, setState] = useState<FormState>('idle')
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setState('sending')
    await new Promise((r) => setTimeout(r, 900))
    setState('success')
  }

  const inputClass =
    'w-full bg-transparent border-b border-pale-gray pb-2.5 font-body text-[14px] text-charcoal placeholder:text-warm-gray focus:outline-none focus:border-charcoal transition-colors duration-300'

  if (state === 'success') {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-[#C4A265]/30 mb-6">
          <svg className="w-7 h-7 text-[#C4A265]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <p className="font-display text-[22px] text-charcoal mb-2">Mensaje enviado</p>
        <p className="font-body text-[14px] text-warm-gray">
          Nos pondremos en contacto en las próximas 24&nbsp;hs.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div className="flex flex-col gap-1.5">
          <label className="font-body text-[11px] uppercase tracking-[0.12em] text-warm-gray">
            Nombre
          </label>
          <input
            name="name"
            type="text"
            required
            value={form.name}
            onChange={handleChange}
            placeholder="Tu nombre"
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-body text-[11px] uppercase tracking-[0.12em] text-warm-gray">
            Email
          </label>
          <input
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="tu@correo.com"
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="font-body text-[11px] uppercase tracking-[0.12em] text-warm-gray">
          Asunto
        </label>
        <select
          name="subject"
          required
          value={form.subject}
          onChange={handleChange}
          className={`${inputClass} cursor-pointer`}
        >
          <option value="" disabled>Seleccioná un motivo</option>
          <option value="pedido">Consulta sobre mi pedido</option>
          <option value="producto">Consulta sobre un producto</option>
          <option value="envio">Envíos y devoluciones</option>
          <option value="mayorista">Ventas mayoristas</option>
          <option value="prensa">Prensa y colaboraciones</option>
          <option value="otro">Otro</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="font-body text-[11px] uppercase tracking-[0.12em] text-warm-gray">
          Mensaje
        </label>
        <textarea
          name="message"
          required
          rows={5}
          value={form.message}
          onChange={handleChange}
          placeholder="Escribí tu mensaje..."
          className={`${inputClass} resize-none`}
        />
      </div>

      <div>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={state === 'sending'}
        >
          {state === 'sending' ? 'Enviando...' : 'Enviar mensaje'}
        </Button>
      </div>
    </form>
  )
}
