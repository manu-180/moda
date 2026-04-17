import Navbar from '@/components/store/Navbar'
import Footer from '@/components/store/Footer'
import LenisProvider from '@/components/store/LenisProvider'

/** Altura del header fijo: barra editorial + nav (alinear con Navbar y HeroSection). */
const STORE_HEADER_OFFSET = 'pt-[88px] md:pt-[104px]'

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <LenisProvider>
      <a
        href="#contenido-tienda"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-sm focus:bg-white focus:px-4 focus:py-3 focus:font-body focus:text-[12px] focus:uppercase focus:tracking-[0.12em] focus:text-charcoal focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-charcoal/20"
      >
        Saltar al contenido
      </a>
      <Navbar />
      <main id="contenido-tienda" className={`min-h-screen ${STORE_HEADER_OFFSET}`}>
        {children}
      </main>
      <Footer />
    </LenisProvider>
  )
}
