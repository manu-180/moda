import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-ivory">
      <p className="font-body text-[12px] uppercase tracking-[0.2em] text-champagne mb-6">404</p>
      <h1 className="font-display italic text-[36px] md:text-[48px] text-charcoal mb-4">Página no encontrada</h1>
      <p className="font-body text-[15px] text-warm-gray mb-10 max-w-[440px]">
        La página que buscás no existe o fue movida.
      </p>
      <Link href="/"><Button>Volver al inicio</Button></Link>
    </div>
  )
}
