'use client'

import Button from '@/components/ui/Button'

export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h1 className="font-body text-[20px] text-charcoal mb-3">Algo salió mal</h1>
      <p className="font-body text-[14px] text-warm-gray mb-6">Ocurrió un error al cargar esta página.</p>
      <Button variant="secondary" onClick={reset}>Reintentar</Button>
    </div>
  )
}
