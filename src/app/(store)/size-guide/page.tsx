import type { Metadata } from 'next'
import Link from 'next/link'
import { getSiteConfig } from '@/lib/site-config'
import { SITE_NAME } from '@/lib/constants'
import Button from '@/components/ui/Button'

export const metadata: Metadata = {
  title: `Guía de talles | ${SITE_NAME}`,
  description:
    'Medidas orientativas en centímetros para elegir tu talle con confianza. Cómo tomarte las medidas y equivalencias de tallas.',
}

const SIZE_ROWS = [
  { size: 'XS', bust: '80–84', waist: '62–66', hip: '88–92' },
  { size: 'S', bust: '84–88', waist: '66–70', hip: '92–96' },
  { size: 'M', bust: '88–92', waist: '70–74', hip: '96–100' },
  { size: 'L', bust: '92–96', waist: '74–78', hip: '100–104' },
  { size: 'XL', bust: '96–100', waist: '78–82', hip: '104–108' },
]

export default async function SizeGuidePage() {
  const { identity } = await getSiteConfig()
  const name = identity.store_name

  return (
    <>
      <section className="bg-cream pt-16 pb-12 border-b border-[#C4A265]/15">
        <div className="max-w-[1600px] mx-auto px-6 md:px-16 text-center">
          <p className="font-body text-[11px] uppercase tracking-[0.2em] text-[#C4A265] mb-4">
            Comprar con precisión
          </p>
          <h1 className="font-display text-[40px] md:text-[56px] text-charcoal leading-none mb-5">
            Guía de talles
          </h1>
          <p className="font-body text-[15px] text-warm-gray max-w-xl mx-auto">
            Referencias en centímetros para que elijas el calce ideal. Las medidas pueden variar según tejido y
            silueta; en cada producto indicamos recomendaciones específicas.
          </p>
        </div>
      </section>

      <section className="bg-cream py-16 md:py-24">
        <div className="max-w-[720px] mx-auto px-6 md:px-16">
          <div className="font-body text-[15px] md:text-[16px] text-charcoal/90 leading-[1.75] space-y-6 mb-12">
            <p>
              Trabajamos con patrones europeos de prêt-à-porter. Si oscilás entre dos talles, en prendas ceñidas
              suele preferirse el menor y en oversize o capas, el mayor. Ante la duda, el equipo de {name} puede
              asesorarte antes de comprar.
            </p>
          </div>

          <div className="overflow-x-auto -mx-1 px-1">
            <table className="w-full min-w-[320px] border-collapse font-body text-[14px] md:text-[15px]">
              <caption className="sr-only">
                Tabla de equivalencias de talle con contorno de busto, cintura y cadera en centímetros
              </caption>
              <thead>
                <tr className="border-b border-[#C4A265]/25">
                  <th
                    scope="col"
                    className="py-3 pr-4 text-left font-body font-normal uppercase tracking-[0.12em] text-[11px] text-[#C4A265]"
                  >
                    Talle
                  </th>
                  <th
                    scope="col"
                    className="py-3 px-2 text-left font-body font-normal text-charcoal/80"
                  >
                    Busto
                  </th>
                  <th
                    scope="col"
                    className="py-3 px-2 text-left font-body font-normal text-charcoal/80"
                  >
                    Cintura
                  </th>
                  <th
                    scope="col"
                    className="py-3 pl-2 text-left font-body font-normal text-charcoal/80"
                  >
                    Cadera
                  </th>
                </tr>
              </thead>
              <tbody>
                {SIZE_ROWS.map((row) => (
                  <tr
                    key={row.size}
                    className="border-b border-[#C4A265]/12 transition-colors hover:bg-[#C4A265]/[0.04]"
                  >
                    <th
                      scope="row"
                      className="py-3.5 pr-4 font-display text-[17px] md:text-[18px] text-charcoal align-middle"
                    >
                      {row.size}
                    </th>
                    <td className="py-3.5 px-2 text-warm-gray tabular-nums">{row.bust} cm</td>
                    <td className="py-3.5 px-2 text-warm-gray tabular-nums">{row.waist} cm</td>
                    <td className="py-3.5 pl-2 text-warm-gray tabular-nums">{row.hip} cm</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="font-body text-[13px] md:text-[14px] text-warm-gray mt-6 leading-relaxed">
            Medidas tomadas sobre el cuerpo, sin ropa gruesa. Busto: perímetro máximo del pecho. Cintura: punto
            más estrecho del torso. Cadera: perímetro máximo de la cadera.
          </p>

          <div className="flex items-center gap-3 my-14">
            <div className="h-px flex-1 bg-[#C4A265]/20" />
            <span className="font-display text-[#C4A265]/40 text-lg" aria-hidden>
              ✦
            </span>
            <div className="h-px flex-1 bg-[#C4A265]/20" />
          </div>

          <p className="font-body text-[14px] text-center text-warm-gray mb-6">
            ¿Necesitás una segunda opinión sobre tu talle? Escribinos con el modelo que te interesa.
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
