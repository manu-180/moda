import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { getSiteConfig } from '@/lib/site-config'
import { SITE_NAME } from '@/lib/constants'
import Button from '@/components/ui/Button'

export const metadata: Metadata = {
  title: `Preguntas frecuentes | ${SITE_NAME}`,
  description:
    'Envíos, cambios, talles, pagos y cuidado de prendas. Respuestas claras para comprar con tranquilidad.',
}

const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: '¿Cómo son los envíos y cuánto tardan?',
    a: 'Procesamos pedidos en 1–2 días hábiles. Los plazos de entrega dependen de la zona y del método elegido; al confirmar la compra verás el estimado. Te enviamos el seguimiento por email cuando el paquete sale del depósito.',
  },
  {
    q: '¿Puedo cambiar o devolver una prenda?',
    a: 'Sí. Tenés un plazo para solicitar cambio o devolución según nuestras condiciones (prenda sin uso, con etiquetas y empaque original cuando aplique). Si algo no calza o no era lo que esperabas, escribinos desde Contacto y te guiamos paso a paso.',
  },
  {
    q: '¿Cómo elijo mi talle?',
    a: 'En cada ficha de producto publicamos medidas orientativas y recomendaciones de calce. Si dudás entre dos talles o tenés una silueta concreta, podés consultarnos antes de comprar: preferimos que elijas bien a la primera.',
  },
  {
    q: '¿Qué medios de pago aceptan?',
    a: 'Aceptamos los medios habilitados en el checkout (tarjetas y otras opciones según disponibilidad regional). El cobro se confirma de forma segura y recibís el comprobante por correo.',
  },
  {
    q: '¿Las prendas requieren cuidados especiales?',
    a: 'Muchas piezas combinan fibras nobles o acabados delicados. Seguí siempre la etiqueta de composición y lavado. Si tenés duda sobre planchado o limpieza en seco, preguntanos por el modelo concreto.',
  },
  {
    q: '¿Cómo contacto al equipo si tengo un problema con mi pedido?',
    a: 'Escribinos por la página de Contacto con tu número de pedido. Respondemos en menos de 24 horas hábiles y priorizamos incidencias de envío o defectos de fabricación.',
  },
]

export default async function FaqPage() {
  const { identity } = await getSiteConfig()
  const name = identity.store_name

  return (
    <>
      <section className="bg-cream pt-16 pb-12 border-b border-[#C4A265]/15">
        <div className="max-w-[1600px] mx-auto px-6 md:px-16 text-center">
          <p className="font-body text-[11px] uppercase tracking-[0.2em] text-[#C4A265] mb-4">
            Ayuda
          </p>
          <h1 className="font-display text-[40px] md:text-[56px] text-charcoal leading-none mb-5">
            Preguntas frecuentes
          </h1>
          <p className="font-body text-[15px] text-warm-gray max-w-xl mx-auto">
            Todo lo que necesitás saber para comprar en {name} con la misma tranquilidad que
            elegís cada prenda.
          </p>
        </div>
      </section>

      <section className="bg-cream py-16 md:py-24">
        <div className="max-w-[720px] mx-auto px-6 md:px-16">
          <div className="border-t border-[#C4A265]/15">
            {FAQ_ITEMS.map((item) => (
              <details
                key={item.q}
                className="group border-b border-[#C4A265]/15"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left font-body text-[15px] md:text-[16px] text-charcoal transition-colors hover:text-charcoal/80 [&::-webkit-details-marker]:hidden">
                  <span className="pr-2 leading-snug">{item.q}</span>
                  <ChevronDown
                    className="h-4 w-4 flex-shrink-0 text-[#C4A265] transition-transform duration-300 ease-out group-open:rotate-180"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                </summary>
                <div className="pb-5 pt-0 font-body text-[14px] md:text-[15px] leading-[1.75] text-warm-gray">
                  {item.a}
                </div>
              </details>
            ))}
          </div>

          <div className="flex items-center gap-3 my-14">
            <div className="h-px flex-1 bg-[#C4A265]/20" />
            <span className="font-display text-[#C4A265]/40 text-lg" aria-hidden>
              ✦
            </span>
            <div className="h-px flex-1 bg-[#C4A265]/20" />
          </div>

          <p className="font-body text-[14px] text-center text-warm-gray mb-6">
            ¿No encontrás lo que buscás? Escribinos y lo vemos juntos.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/contact">
              <Button variant="primary">Contacto</Button>
            </Link>
            <Link href="/products">
              <Button variant="secondary">Ver tienda</Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
