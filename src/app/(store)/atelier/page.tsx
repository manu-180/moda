import type { Metadata } from 'next'
import Link from 'next/link'
import { getSiteConfig } from '@/lib/site-config'
import { SITE_NAME } from '@/lib/constants'
import Button from '@/components/ui/Button'

export const metadata: Metadata = {
  title: `Atelier | ${SITE_NAME}`,
  description:
    'El taller creativo de la casa: proceso de diseño, patronaje y confección con estándares de alta costura aplicados al prêt-à-porter.',
}

export default async function AtelierPage() {
  const { identity } = await getSiteConfig()
  const name = identity.store_name

  return (
    <>
      <section className="bg-cream pt-16 pb-12 border-b border-[#C4A265]/15">
        <div className="max-w-[1600px] mx-auto px-6 md:px-16 text-center">
          <p className="font-body text-[11px] uppercase tracking-[0.2em] text-[#C4A265] mb-4">
            Savoir-faire
          </p>
          <h1 className="font-display text-[40px] md:text-[56px] text-charcoal leading-none mb-5">
            Atelier
          </h1>
          <p className="font-body text-[15px] text-warm-gray max-w-xl mx-auto">
            Donde cada colección toma forma: bocetos, moldería y pruebas hasta lograr el calce y la caída que
            definimos para {name}.
          </p>
        </div>
      </section>

      <section className="bg-cream py-16 md:py-24">
        <div className="max-w-[720px] mx-auto px-6 md:px-16">
          <div className="font-body text-[15px] md:text-[16px] text-charcoal/90 leading-[1.75] space-y-6">
            <p>
              El atelier es el corazón del proceso. Partimos de referencias de arte, arquitectura y calle, y las
              traducimos en siluetas contemporáneas. Cada prenda pasa por iteraciones de prototipo: ajustamos
              hombros, largos y proporciones hasta que la pieza se sienta natural en distintos cuerpos.
            </p>
            <p>
              Seleccionamos tejidos por tacto, peso y durabilidad; combinamos fibras naturales y acabados que
              envejecen bien. Las confecciones privilegian costuras limpias, acabados internos cuidados y
              terminaciones que sostienen el uso cotidiano sin perder elegancia.
            </p>
            <p>
              Creemos en un ritmo de producción acorde a la calidad: lotes acotados, control de calidad en cada
              etapa y relación directa con quienes cosén y terminan las prendas. Esa cercanía es lo que permite
              que {name} mantenga coherencia entre lo prometido en el diseño y lo que llega a tu vestidor.
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
              <Button variant="primary">Explorar colecciones</Button>
            </Link>
            <Link href="/contact">
              <Button variant="secondary">Consultas</Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
