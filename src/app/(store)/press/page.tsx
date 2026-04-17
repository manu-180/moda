import type { Metadata } from 'next'
import Link from 'next/link'
import { getSiteConfig } from '@/lib/site-config'
import { SITE_NAME } from '@/lib/constants'
import Button from '@/components/ui/Button'

export const metadata: Metadata = {
  title: `Prensa | ${SITE_NAME}`,
  description:
    'Notas de presa, solicitudes de información y contacto para medios sobre la marca y sus colecciones.',
}

export default async function PressPage() {
  const { identity, contact } = await getSiteConfig()
  const name = identity.store_name
  const pressEmail = contact.email

  return (
    <>
      <section className="bg-cream pt-16 pb-12 border-b border-[#C4A265]/15">
        <div className="max-w-[1600px] mx-auto px-6 md:px-16 text-center">
          <p className="font-body text-[11px] uppercase tracking-[0.2em] text-[#C4A265] mb-4">
            Medios
          </p>
          <h1 className="font-display text-[40px] md:text-[56px] text-charcoal leading-none mb-5">
            Prensa
          </h1>
          <p className="font-body text-[15px] text-warm-gray max-w-xl mx-auto">
            Información para editores, estilismo y solicitudes de imágenes de {name}.
          </p>
        </div>
      </section>

      <section className="bg-cream py-16 md:py-24">
        <div className="max-w-[720px] mx-auto px-6 md:px-16">
          <div className="font-body text-[15px] md:text-[16px] text-charcoal/90 leading-[1.75] space-y-6">
            <p>
              Agradecemos el interés de quienes cubren moda, diseño y lifestyle. Podemos facilitar notas sobre
              colecciones, proceso creativo y valores de la casa, sujeto a disponibilidad del equipo.
            </p>
            <p>
              Para pedidos de préstamo de prendas, entrevistas o material gráfico de alta resolución, escribinos
              indicando medio, plazo y tipo de contenido. Respondemos en un plazo habitual de 3 a 5 días hábiles.
            </p>
            {pressEmail && (
              <p>
                Contacto sugerido para prensa:{' '}
                <a
                  href={`mailto:${pressEmail}?subject=Prensa%20-%20${encodeURIComponent(name)}`}
                  className="text-charcoal underline decoration-[#C4A265]/50 underline-offset-4 hover:decoration-[#C4A265] transition-colors"
                >
                  {pressEmail}
                </a>
                .
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 my-14">
            <div className="h-px flex-1 bg-[#C4A265]/20" />
            <span className="font-display text-[#C4A265]/40 text-lg" aria-hidden>
              ✦
            </span>
            <div className="h-px flex-1 bg-[#C4A265]/20" />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/contact">
              <Button variant="primary">Formulario de contacto</Button>
            </Link>
            <Link href="/collections">
              <Button variant="secondary">Colecciones</Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
