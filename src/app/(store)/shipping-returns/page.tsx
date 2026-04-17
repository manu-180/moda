import type { Metadata } from 'next'
import Link from 'next/link'
import { getSiteConfig } from '@/lib/site-config'
import { SITE_NAME } from '@/lib/constants'
import { formatPrice } from '@/lib/utils'
import Button from '@/components/ui/Button'

export const metadata: Metadata = {
  title: `Envíos y devoluciones | ${SITE_NAME}`,
  description:
    'Plazos de entrega, envío bonificado, cambios y devoluciones. Condiciones claras para comprar con tranquilidad.',
}

export default async function ShippingReturnsPage() {
  const { identity, commerce } = await getSiteConfig()
  const name = identity.store_name
  const threshold = commerce.free_shipping_threshold
  const standardFee = commerce.shipping_standard

  return (
    <>
      <section className="bg-cream pt-16 pb-12 border-b border-[#C4A265]/15">
        <div className="max-w-[1600px] mx-auto px-6 md:px-16 text-center">
          <p className="font-body text-[11px] uppercase tracking-[0.2em] text-[#C4A265] mb-4">
            Servicio
          </p>
          <h1 className="font-display text-[40px] md:text-[56px] text-charcoal leading-none mb-5">
            Envíos y devoluciones
          </h1>
          <p className="font-body text-[15px] text-warm-gray max-w-xl mx-auto">
            Transparencia en cada etapa: desde que confirmás el pedido hasta un posible cambio de talle o
            devolución.
          </p>
        </div>
      </section>

      <section className="bg-cream py-16 md:py-24">
        <div className="max-w-[720px] mx-auto px-6 md:px-16">
          <article className="font-body text-[15px] md:text-[16px] text-charcoal/90 leading-[1.75] space-y-10">
            <div>
              <h2 className="font-display text-[22px] md:text-[26px] text-charcoal mb-4">Envíos</h2>
              <p className="text-warm-gray mb-4">
                Procesamos pedidos en 1–2 días hábiles. Cuando el paquete sale del depósito, recibís el número de
                seguimiento por correo.
              </p>
              <ul className="list-none space-y-3 pl-0 border-l-2 border-[#C4A265]/25 pl-5">
                <li>
                  <span className="text-charcoal">Envío estándar:</span>{' '}
                  <span className="text-warm-gray">entrega estimada 5–7 días hábiles según zona.</span>
                </li>
                <li>
                  <span className="text-charcoal">Envío express:</span>{' '}
                  <span className="text-warm-gray">2–3 días hábiles en las zonas habilitadas.</span>
                </li>
                <li>
                  <span className="text-charcoal">Envío bonificado:</span>{' '}
                  <span className="text-warm-gray">
                    en compras desde {formatPrice(threshold)} el costo de envío está bonificado (se aplica al
                    subtotal antes de impuestos).
                  </span>
                </li>
                <li>
                  <span className="text-charcoal">Costo estándar:</span>{' '}
                  <span className="text-warm-gray">
                    si el pedido no alcanza el mínimo, el envío estándar es {formatPrice(standardFee)}; verás el
                    desglose exacto en el checkout.
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-[22px] md:text-[26px] text-charcoal mb-4">Cambios y devoluciones</h2>
              <p className="text-warm-gray mb-4">
                Queremos que cada pieza sea la correcta. Si el talle no calza o la prenda no era lo que esperabas,
                podés solicitar cambio o devolución dentro de los <strong className="font-medium text-charcoal/90">30 días</strong> desde que recibís el pedido.
              </p>
              <ul className="space-y-3 text-warm-gray list-disc pl-5 marker:text-[#C4A265]">
                <li>Prenda sin uso, en perfecto estado, con etiquetas originales cuando corresponda.</li>
                <li>Empaque o funda original si venía incluida en la entrega.</li>
                <li>
                  Indumentaria íntima, accesorios sellados o piezas marcadas como final sale pueden tener condiciones
                  especiales; te las indicamos en la ficha del producto.
                </li>
              </ul>
              <p className="text-warm-gray mt-4">
                Para iniciar un cambio o una devolución, escribinos desde{' '}
                <Link href="/contact" className="text-charcoal underline underline-offset-4 decoration-[#C4A265]/50 hover:decoration-[#C4A265]">
                  Contacto
                </Link>{' '}
                con tu número de pedido. Te respondemos en menos de 24 horas hábiles y te guiamos en los pasos.
              </p>
            </div>

            <div>
              <h2 className="font-display text-[22px] md:text-[26px] text-charcoal mb-4">Reembolsos</h2>
              <p className="text-warm-gray">
                Una vez recibida y revisada la prenda en nuestro depósito, procesamos el reembolso en el mismo medio
                de pago utilizado en la compra, salvo que acordemos otra opción. Los plazos de acreditación dependen
                del banco o la tarjeta.
              </p>
            </div>

            <p className="text-[14px] text-warm-gray/90 pt-2">
              Las condiciones anteriores aplican a compras realizadas en {name}. Ante cualquier duda, el equipo está
              a disposición.
            </p>
          </article>

          <div className="flex items-center gap-3 my-14">
            <div className="h-px flex-1 bg-[#C4A265]/20" />
            <span className="font-display text-[#C4A265]/40 text-lg" aria-hidden>
              ✦
            </span>
            <div className="h-px flex-1 bg-[#C4A265]/20" />
          </div>

          <p className="font-body text-[14px] text-center text-warm-gray mb-6">
            Más respuestas en nuestras preguntas frecuentes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/faq">
              <Button variant="primary">Preguntas frecuentes</Button>
            </Link>
            <Link href="/contact">
              <Button variant="secondary">Contacto</Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
