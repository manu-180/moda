'use client'

import Button from '@/components/ui/Button'

export default function StoreError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <div className="w-12 h-[1px] bg-champagne mb-8" />
      <h1 className="font-display italic text-[28px] text-charcoal mb-3">Algo salió mal</h1>
      <p className="font-body text-[14px] text-warm-gray mb-8 max-w-[400px]">
        Pedimos disculpas por las molestias. Por favor, intentá de nuevo.
      </p>
      <Button variant="secondary" onClick={reset}>Reintentar</Button>
    </div>
  )
}
