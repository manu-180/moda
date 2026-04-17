import type { Metadata } from 'next'
import Link from 'next/link'
import { getSiteConfig } from '@/lib/site-config'
import { SITE_NAME } from '@/lib/constants'
import Button from '@/components/ui/Button'

export const metadata: Metadata = {
  title: `Nuestra historia | ${SITE_NAME}`,
  description:
    'Origen, visión y savoir-faire de la casa: moda contemporánea con alma artesanal y compromiso con el detalle.',
}

export default async function AboutPage() {
  const { identity } = await getSiteConfig()
  const name = identity.store_name

  return (
    <>
      <section className="bg-cream pt-16 pb-12 border-b border-[#C4A265]/15">
        <div className="max-w-[1600px] mx-auto px-6 md:px-16 text-center">
          <p className="font-body text-[11px] uppercase tracking-[0.2em] text-[#C4A265] mb-4">
            La casa
          </p>
          <h1 className="font-display text-[40px] md:text-[56px] text-charcoal leading-none mb-5">
            Nuestra historia
          </h1>
          <p className="font-body text-[15px] text-warm-gray max-w-xl mx-auto">
            {identity.tagline
              ? `${identity.tagline} — así define ${name} su propuesta.`
              : `Una visión de moda pensada para durar: siluetas limpias, materiales nobles y producción consciente.`}
          </p>
        </div>
      </section>

      <section className="bg-cream py-16 md:py-24">
        <div className="max-w-[720px] mx-auto px-6 md:px-16">
          <div className="font-body text-[15px] md:text-[16px] text-charcoal/90 leading-[1.75] space-y-6">
            <p>
              {name} nace del deseo de ofrecer prendas que acompañen la vida real: versátiles, refinadas y
              confeccionadas con estándares exigentes. Cada colección equilibra tendencia y permanencia, para
              que el vestuario se sienta actual sin perder identidad.
            </p>
            <p>
              Trabajamos con talleres y proveedores seleccionados, priorizando calidad de corte, caída de
              telas y terminaciones impecables. Creemos que el lujo está en el detalle silencioso: un forro
              bien resuelto, un botón al tono, una silueta que favorece sin esfuerzo.
            </p>
            <p>
              Nuestro camino es evolutivo: escuchamos a quienes eligen {name}, afinamos procesos y sumamos
              propuestas que reflejen una estética coherente con valores de respeto y transparencia.
            </p>
          </div>

          <div className="flex items-center gap-3 my-14">
            <div className="h-px flex-1 bg-[#C4A265]/20" />
            <span className="font-display text-[#C4A265]/40 text-lg" aria-hidden>
              ✦
            </span>
            <div className="h-px flex-1 bg-[#C4A265]/20" />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/collections">
              <Button variant="primary">Ver colecciones</Button>
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
