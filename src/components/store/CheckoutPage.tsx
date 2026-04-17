'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp, Shield, Package, RefreshCw, Phone, AlertCircle } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, cn } from '@/lib/utils'
import { getPrimaryProductImageUrl } from '@/lib/editorial-images'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { useSiteConfig } from '@/lib/site-config-context'

const STEPS = [
  { label: 'Información', roman: 'I' },
  { label: 'Envío', roman: 'II' },
  { label: 'Pago', roman: 'III' },
]

const COUNTRIES = [
  { label: 'Argentina', value: 'AR' },
  { label: 'Estados Unidos', value: 'US' },
  { label: 'Reino Unido', value: 'GB' },
  { label: 'Francia', value: 'FR' },
  { label: 'Italia', value: 'IT' },
  { label: 'España', value: 'ES' },
  { label: 'Alemania', value: 'DE' },
  { label: 'Brasil', value: 'BR' },
]

interface FormData {
  email: string
  firstName: string
  lastName: string
  address1: string
  address2: string
  city: string
  state: string
  postalCode: string
  country: string
  phone: string
}

interface FormErrors {
  [key: string]: string
}

interface RpcResponse {
  success: boolean
  order_id?: string
  order_number?: string
  error_code?: string
  error_message?: string
  variant_id?: string
  available_stock?: number
}

export default function CheckoutPageContent() {
  const router = useRouter()
  const items = useCartStore((s) => s.items)
  const getTotal = useCartStore((s) => s.getTotal)
  const getItemCount = useCartStore((s) => s.getItemCount)
  const clearCart = useCartStore((s) => s.clearCart)

  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showMobileSummary, setShowMobileSummary] = useState(false)
  const [form, setForm] = useState<FormData>({
    email: '', firstName: '', lastName: '', address1: '', address2: '',
    city: '', state: '', postalCode: '', country: '', phone: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const { commerce, identity, contact } = useSiteConfig()
  const subtotal = getTotal()
  const shipping = subtotal >= commerce.free_shipping_threshold ? 0 : commerce.shipping_standard
  const tax = Math.round(subtotal * commerce.tax_rate * 100) / 100
  const total = subtotal + shipping + tax

  function updateField(field: keyof FormData, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
    if (errors[field]) setErrors((e) => { const n = { ...e }; delete n[field]; return n })
    if (submitError) setSubmitError(null)
  }

  function validate(): boolean {
    const e: FormErrors = {}
    if (!form.email) e.email = 'El correo es obligatorio'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Correo no válido'
    if (!form.firstName) e.firstName = 'El nombre es obligatorio'
    if (!form.lastName) e.lastName = 'El apellido es obligatorio'
    if (!form.address1) e.address1 = 'La dirección es obligatoria'
    if (!form.city) e.city = 'La ciudad es obligatoria'
    if (!form.state) e.state = 'La provincia es obligatoria'
    if (!form.postalCode) e.postalCode = 'El código postal es obligatorio'
    if (!form.country) e.country = 'El país es obligatorio'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    setLoading(true)
    setSubmitError(null)

    try {
      const supabase = createClient()

      const rpcItems = items.map((item) => ({
        variant_id: item.variant.id,
        quantity: item.quantity,
        unit_price: item.product.price,
      }))

      const { data, error } = await supabase.rpc('create_order_with_stock_check', {
        p_customer_email: form.email,
        p_customer_name: `${form.firstName} ${form.lastName}`.trim(),
        p_shipping_address: {
          line1: form.address1,
          line2: form.address2 || undefined,
          city: form.city,
          state: form.state,
          postal_code: form.postalCode,
          country: form.country,
          phone: form.phone || undefined,
        },
        p_items: rpcItems,
        p_shipping: shipping,
        p_tax: tax,
      })

      if (error) {
        setSubmitError('No pudimos procesar tu pedido. Verificá tu conexión e intentá de nuevo.')
        setLoading(false)
        return
      }

      const response = data as RpcResponse

      if (!response?.success) {
        setSubmitError(response?.error_message || 'No pudimos completar tu pedido.')
        setLoading(false)
        return
      }

      clearCart()
      router.push(`/checkout?confirmed=${response.order_number}`)
    } catch {
      setSubmitError('Ocurrió un error inesperado. Intentá de nuevo en unos segundos.')
      setLoading(false)
    }
  }

  const confirmed = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('confirmed')
    : null

  // ─────────────────────────────────────────────────────────────
  // CONFIRMATION VIEW
  // ─────────────────────────────────────────────────────────────
  if (confirmed) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="max-w-[540px] w-full text-center"
        >
          <p className="font-body text-[10px] uppercase tracking-[0.3em] text-champagne mb-6">
            Confirmación
          </p>
          <div className="w-10 h-[1px] bg-champagne mx-auto mb-8" />
          <h1 className="font-display italic text-[34px] md:text-[42px] leading-[1.15] text-charcoal mb-5">
            Gracias por tu pedido
          </h1>
          <p className="font-body text-[13px] text-warm-gray leading-relaxed mb-8 max-w-[400px] mx-auto">
            Tu selección ha sido recibida. Preparamos cada pieza con el máximo cuidado y te enviaremos el detalle de seguimiento en las próximas horas.
          </p>
          <div className="inline-block border border-pale-gray px-8 py-4 mb-10">
            <p className="font-body text-[10px] uppercase tracking-[0.2em] text-warm-gray mb-1.5">
              Número de pedido
            </p>
            <p className="font-display text-[18px] text-charcoal tracking-[0.1em]">
              {confirmed}
            </p>
          </div>
          <div>
            <Link href="/products">
              <Button variant="secondary">Continuar explorando</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-[600px] mx-auto px-6 py-24 text-center">
        <p className="font-body text-[10px] uppercase tracking-[0.3em] text-champagne mb-6">
          Tu bolsa
        </p>
        <div className="w-10 h-[1px] bg-champagne mx-auto mb-8" />
        <h1 className="font-display italic text-[32px] text-charcoal mb-8">
          Tu bolsa está vacía
        </h1>
        <Link href="/products"><Button>Comenzar a comprar</Button></Link>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────
  // MAIN CHECKOUT
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 lg:px-16 py-10 md:py-16">

        {/* HEADER EDITORIAL */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-12 md:mb-16"
        >
          <p className="font-body text-[10px] uppercase tracking-[0.3em] text-champagne mb-4">
            Finalizar adquisición
          </p>
          <div className="w-10 h-[1px] bg-champagne mx-auto mb-6" />
          <h1 className="font-display italic text-[30px] md:text-[40px] leading-[1.1] text-charcoal">
            Un último paso
          </h1>
        </motion.div>

        {/* STEPPER */}
        <div className="flex items-center justify-center gap-3 md:gap-6 mb-14 md:mb-20">
          {STEPS.map((step, i) => {
            const active = i === 0
            return (
              <div key={step.label} className="flex items-center gap-3 md:gap-6">
                <div className="flex flex-col items-center gap-2">
                  <span className={cn(
                    'font-display italic text-[18px] md:text-[22px] transition-colors duration-500',
                    active ? 'text-champagne' : 'text-pale-gray'
                  )}>
                    {step.roman}
                  </span>
                  <span className={cn(
                    'font-body text-[10px] md:text-[11px] uppercase tracking-[0.2em] transition-colors duration-500',
                    active ? 'text-charcoal' : 'text-warm-gray'
                  )}>
                    {step.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn(
                    'w-10 md:w-20 h-[1px] transition-colors duration-500 mb-6',
                    active ? 'bg-champagne/40' : 'bg-pale-gray'
                  )} />
                )}
              </div>
            )
          })}
        </div>

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">

          {/* FORMULARIO */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex-1"
          >
            <section className="mb-12">
              <div className="mb-8">
                <p className="font-body text-[10px] uppercase tracking-[0.25em] text-champagne mb-2">
                  Sección I
                </p>
                <h2 className="font-display italic text-[22px] md:text-[26px] text-charcoal">
                  Datos de contacto
                </h2>
                <p className="font-body text-[12px] text-warm-gray mt-2 leading-relaxed">
                  Recibirás actualizaciones sobre tu pedido en esta dirección.
                </p>
              </div>
              <Input
                label="Correo electrónico"
                type="email"
                id="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                error={errors.email}
              />
            </section>

            <div className="flex items-center gap-4 my-12">
              <div className="flex-1 h-[1px] bg-pale-gray" />
              <span className="font-display italic text-champagne text-[14px]">·</span>
              <div className="flex-1 h-[1px] bg-pale-gray" />
            </div>

            <section className="mb-12">
              <div className="mb-8">
                <p className="font-body text-[10px] uppercase tracking-[0.25em] text-champagne mb-2">
                  Sección II
                </p>
                <h2 className="font-display italic text-[22px] md:text-[26px] text-charcoal">
                  Dirección de envío
                </h2>
                <p className="font-body text-[12px] text-warm-gray mt-2 leading-relaxed">
                  Enviamos cada pieza en empaque premium, con servicio asegurado.
                </p>
              </div>

              <div className="flex flex-col gap-7">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Nombre" id="firstName" value={form.firstName}
                    onChange={(e) => updateField('firstName', e.target.value)} error={errors.firstName} />
                  <Input label="Apellido" id="lastName" value={form.lastName}
                    onChange={(e) => updateField('lastName', e.target.value)} error={errors.lastName} />
                </div>
                <Input label="Dirección" id="address1" value={form.address1}
                  onChange={(e) => updateField('address1', e.target.value)} error={errors.address1} />
                <Input label="Departamento, piso, etc. (opcional)" id="address2" value={form.address2}
                  onChange={(e) => updateField('address2', e.target.value)} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Ciudad" id="city" value={form.city}
                    onChange={(e) => updateField('city', e.target.value)} error={errors.city} />
                  <Input label="Provincia / Estado" id="state" value={form.state}
                    onChange={(e) => updateField('state', e.target.value)} error={errors.state} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Código postal" id="postalCode" value={form.postalCode}
                    onChange={(e) => updateField('postalCode', e.target.value)} error={errors.postalCode} />
                  <Select
                    label="País"
                    options={COUNTRIES}
                    value={form.country}
                    onChange={(v) => updateField('country', v)}
                    error={errors.country}
                  />
                </div>
                <Input label="Teléfono (opcional)" id="phone" type="tel" value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)} />
              </div>
            </section>

            {/* ERROR DEL BACKEND (stock, precio, etc.) */}
            {submitError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 border border-muted-red/40 bg-muted-red/5 px-5 py-4 flex items-start gap-3"
              >
                <AlertCircle className="w-4 h-4 text-muted-red shrink-0 mt-0.5" strokeWidth={1.5} />
                <div className="flex-1 min-w-0">
                  <p className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-red mb-1">
                    No pudimos completar tu pedido
                  </p>
                  <p className="font-body text-[13px] text-charcoal leading-relaxed">
                    {submitError}
                  </p>
                  <Link
                    href="/cart"
                    className="inline-block mt-3 font-body text-[11px] uppercase tracking-[0.15em] text-charcoal underline underline-offset-4 decoration-champagne hover:decoration-charcoal"
                  >
                    Revisar mi bolsa
                  </Link>
                </div>
              </motion.div>
            )}

            <div className="mt-14">
              <Button
                fullWidth
                loading={loading}
                onClick={handleSubmit}
                className="h-[56px] text-[12px] tracking-[0.18em]"
              >
                Confirmar pedido
              </Button>

              <Link
                href="/cart"
                className="block mt-5 font-body text-[11px] uppercase tracking-[0.18em] text-warm-gray text-center hover:text-charcoal transition-colors duration-300"
              >
                ← Volver a la bolsa
              </Link>
            </div>

            {/* ASISTENCIA PERSONAL */}
            <div className="mt-16 pt-10 border-t border-pale-gray">
              <div className="flex items-start gap-5">
                <div className="shrink-0 w-11 h-11 rounded-full border border-champagne/50 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-champagne" strokeWidth={1.25} />
                </div>
                <div className="flex-1">
                  <p className="font-body text-[10px] uppercase tracking-[0.25em] text-champagne mb-1.5">
                    Asistencia personal
                  </p>
                  <h3 className="font-display italic text-[18px] text-charcoal mb-2">
                    ¿Necesitás ayuda con tu pedido?
                  </h3>
                  <p className="font-body text-[12px] text-warm-gray leading-relaxed">
                    Nuestro equipo está disponible de lunes a sábado de 10 a 19hs.{' '}
                    {contact.phone && (
                      <a href={`tel:${contact.phone}`} className="text-charcoal underline underline-offset-4 decoration-champagne hover:decoration-charcoal transition-colors">
                        {contact.phone}
                      </a>
                    )}
                    {contact.phone && contact.email && ' · '}
                    {contact.email && (
                      <a href={`mailto:${contact.email}`} className="text-charcoal underline underline-offset-4 decoration-champagne hover:decoration-charcoal transition-colors">
                        {contact.email}
                      </a>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* RESUMEN */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-full lg:w-[44%] lg:shrink-0"
          >
            <button
              onClick={() => setShowMobileSummary(!showMobileSummary)}
              className="lg:hidden w-full flex items-center justify-between py-4 border-y border-pale-gray mb-6"
            >
              <span className="font-body text-[11px] uppercase tracking-[0.18em] text-charcoal">
                Tu selección ({getItemCount()})
              </span>
              <div className="flex items-center gap-3">
                <span className="font-display text-[16px] text-charcoal">{formatPrice(total)}</span>
                {showMobileSummary ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </button>

            <div className={cn('lg:block', showMobileSummary ? 'block' : 'hidden')}>
              <div className="bg-ivory border border-pale-gray/60 lg:sticky lg:top-[100px]">

                <div className="px-8 md:px-10 pt-9 pb-6 border-b border-pale-gray/60">
                  <p className="font-body text-[10px] uppercase tracking-[0.3em] text-champagne mb-2">
                    Tu selección
                  </p>
                  <h2 className="font-display italic text-[22px] text-charcoal">
                    Resumen del pedido
                  </h2>
                </div>

                <div className="px-8 md:px-10 py-7 flex flex-col gap-6">
                  {items.map((item) => (
                    <div key={item.variant.id} className="flex gap-4">
                      <div className="relative w-16 h-[84px] bg-cream shrink-0 overflow-hidden">
                        <Image
                          src={getPrimaryProductImageUrl(item.product)}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                        <span className="absolute -top-1.5 -right-1.5 h-5 w-5 flex items-center justify-center bg-charcoal text-white text-[9px] font-body rounded-full">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 flex justify-between min-w-0 pt-0.5">
                        <div className="min-w-0 pr-3">
                          <p className="font-body text-[13px] text-charcoal truncate mb-1">
                            {item.product.name}
                          </p>
                          <p className="font-body text-[11px] text-warm-gray tracking-[0.05em]">
                            {item.variant.color} · Talle {item.variant.size}
                          </p>
                        </div>
                        <span className="font-body text-[13px] text-charcoal shrink-0 tabular-nums">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-8 md:px-10">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-[1px] bg-pale-gray" />
                    <span className="font-display italic text-champagne text-[12px]">·</span>
                    <div className="flex-1 h-[1px] bg-pale-gray" />
                  </div>
                </div>

                <div className="px-8 md:px-10 py-7 flex flex-col gap-3 font-body text-[13px]">
                  <div className="flex justify-between">
                    <span className="text-dark-gray">Subtotal</span>
                    <span className="text-charcoal tabular-nums">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-gray">Envío</span>
                    <span className={cn(
                      'tabular-nums',
                      shipping === 0 ? 'text-champagne italic font-display text-[14px]' : 'text-charcoal'
                    )}>
                      {shipping === 0 ? 'Bonificado' : formatPrice(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-gray">Impuestos</span>
                    <span className="text-charcoal tabular-nums">{formatPrice(tax)}</span>
                  </div>
                </div>

                <div className="px-8 md:px-10 py-6 bg-charcoal text-white">
                  <div className="flex justify-between items-baseline">
                    <span className="font-body text-[11px] uppercase tracking-[0.22em]">
                      Total
                    </span>
                    <span className="font-display text-[24px] tabular-nums">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-4">
                {[
                  { Icon: Package, label: 'Empaque premium' },
                  { Icon: Shield, label: 'Envío asegurado' },
                  { Icon: RefreshCw, label: 'Devolución en 30 días' },
                ].map(({ Icon, label }) => (
                  <div key={label} className="flex flex-col items-center text-center gap-2 py-3">
                    <Icon className="w-4 h-4 text-champagne" strokeWidth={1.25} />
                    <span className="font-body text-[9px] md:text-[10px] uppercase tracking-[0.15em] text-warm-gray leading-tight">
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center">
                <p className="font-display italic text-[12px] text-warm-gray">
                  {identity.store_name}
                </p>
                <p className="font-body text-[9px] uppercase tracking-[0.3em] text-warm-gray mt-1">
                  Desde {commerce.footer_copyright_year}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
