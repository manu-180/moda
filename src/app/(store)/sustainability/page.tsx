import type { Metadata } from 'next'
import Link from 'next/link'
import { getSiteConfig } from '@/lib/site-config'
import { SITE_NAME } from '@/lib/constants'
import Button from '@/components/ui/Button'

export const metadata: Metadata = {
  title: `Sostenibilidad | ${SITE_NAME}`,
  description:
    'Compromiso de la casa con materiales responsables, producción consciente y transparencia en la cadena de valor.',
}

export default async function SustainabilityPage() {
  const { identity } = await getSiteConfig()
  const name = identity.store_name

  return (
    <>
      <section className="bg-cream pt-16 pb-12 border-b border-[#C4A265]/15">
        <div className="max-w-[1600px] mx-auto px-6 md:px-16 text-center">
          <p className="font-body text-[11px] uppercase tracking-[0.2em] text-[#C4A265] mb-4">
            Responsabilidad
          </p>
          <h1 className="font-display text-[40px] md:text-[56px] text-charcoal leading-none mb-5">
            Sostenibilidad
          </h1>
          <p className="font-body text-[15px] text-warm-gray max-w-xl mx-auto">
            Menos volumen, más intención: en {name} trabajamos para alinear estética, calidad y cuidado del
            entorno en cada decisión.
          </p>
        </div>
      </section>

      <section className="bg-cream py-16 md:py-24">
        <div className="max-w-[720px] mx-auto px-6 md:px-16">
          <div className="font-body text-[15px] md:text-[16px] text-charcoal/90 leading-[1.75] space-y-6">
            <p>
              Priorizamos fibras naturales y tejidos con trazabilidad cuando es posible, y evitamos
              sobreproducir: lanzamos series acotadas para reducir inventario muerto y dar tiempo a que cada
              pieza encuentre dueña.
            </p>
            <p>
              Elegimos proveedores que compartan criterios de respeto laboral y buenas prácticas. El mantenimiento
              de prendas —lavado suave, reparaciones, segunda vida— forma parte de cómo pensamos la moda: durar
              es la forma más directa de ser más sostenibles.
            </p>
            <p>
              Seguimos mejorando: medimos lo que podemos, ajustamos procesos y comunicamos con honestidad los
              avances y los límites. Si tenés consultas sobre materiales o cadena de suministro, el equipo de{' '}
              {name} está disponible para conversar.
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
              <Button variant="secondary">Escribinos</Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
