'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('Correo o contraseña incorrectos')
      setLoading(false)
      return
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-6">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-12">
          <h1 className="font-display text-[28px] tracking-[0.08em] text-charcoal">
            MAISON ÉLARA
          </h1>
          <p className="font-body text-[11px] uppercase tracking-[0.15em] text-warm-gray mt-3">
            Acceso administración
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-7">
          <Input
            label="Correo electrónico"
            type="email"
            id="login-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <Input
            label="Contraseña"
            type="password"
            id="login-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          {error && (
            <p className="font-body text-[12px] text-muted-red text-center">{error}</p>
          )}

          <Button type="submit" fullWidth loading={loading} className="mt-2">
            Entrar
          </Button>
        </form>
      </div>
    </div>
  )
}
