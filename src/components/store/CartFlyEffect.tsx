'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { useCartAnimationStore, type FlyAnimation, type BurstAnimation } from '@/lib/store/cart-animation'

// Champagne gold — visible sobre fondo blanco y oscuro, sin sombra agresiva
const BALL_COLOR = '#c9a96e'
const BALL_GLOW = 'rgba(180, 140, 70, 0.3)'
const RING_COLOR = 'rgba(201, 169, 110, 1)'

/** Encuentra el botón de la bolsa visible en pantalla (desktop o mobile) */
function getBagIconRect(): DOMRect | null {
  const candidates = Array.from(document.querySelectorAll('[data-cart-bag]'))
  const visible = candidates.find((el) => {
    const r = el.getBoundingClientRect()
    return r.width > 0 && r.height > 0
  })
  return visible ? visible.getBoundingClientRect() : null
}

// ─── Burst de impacto (flash + 2 anillos) ─────────────────────────────────
function ImpactBurst({ id, x, y }: BurstAnimation) {
  const removeBurst = useCartAnimationStore((s) => s.removeBurst)

  const base: React.CSSProperties = {
    position: 'fixed',
    left: x,
    top: y,
    pointerEvents: 'none',
    zIndex: 99999,
    borderRadius: '50%',
  }

  return (
    <>
      {/* Flash central — se expande y desaparece rápido */}
      <motion.div
        style={{
          ...base,
          width: 28,
          height: 28,
          marginLeft: -14,
          marginTop: -14,
          background: BALL_COLOR,
        }}
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: 3, opacity: 0 }}
        transition={{ duration: 0.38, ease: [0.2, 0.9, 0.4, 1] }}
        onAnimationComplete={() => removeBurst(id)}
      />

      {/* Anillo 1 — expansión media */}
      <motion.div
        style={{
          ...base,
          width: 52,
          height: 52,
          marginLeft: -26,
          marginTop: -26,
          border: `2.5px solid ${RING_COLOR}`,
          background: 'transparent',
        }}
        initial={{ scale: 0.1, opacity: 1 }}
        animate={{ scale: 2.6, opacity: 0 }}
        transition={{ duration: 0.55, ease: [0.15, 0.9, 0.45, 1] }}
      />

      {/* Anillo 2 — expansión lenta, más grande */}
      <motion.div
        style={{
          ...base,
          width: 52,
          height: 52,
          marginLeft: -26,
          marginTop: -26,
          border: `1.5px solid ${RING_COLOR}`,
          background: 'transparent',
        }}
        initial={{ scale: 0.1, opacity: 0.7 }}
        animate={{ scale: 4.2, opacity: 0 }}
        transition={{ duration: 0.78, ease: [0.15, 0.9, 0.45, 1], delay: 0.07 }}
      />
    </>
  )
}

// ─── Bolita voladora ───────────────────────────────────────────────────────
function FlyBall({ id, originX, originY }: FlyAnimation) {
  const removeAnimation = useCartAnimationStore((s) => s.removeAnimation)
  const triggerBurst = useCartAnimationStore((s) => s.triggerBurst)
  const incrementGlow = useCartAnimationStore((s) => s.incrementGlow)
  const [dest, setDest] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const rect = getBagIconRect()
    if (!rect) return
    setDest({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    })
  }, [])

  if (!dest) return null

  const dx = dest.x - originX
  const dy = dest.y - originY

  // Arco parabólico: cuánto sube en el punto medio por encima de la línea recta
  const arcLift = Math.min(Math.abs(dy) * 0.6 + 75, 155)
  // Desviación lateral suave en el punto medio
  const arcDrift = dx * 0.18

  return (
    <motion.div
      aria-hidden
      style={{
        position: 'fixed',
        left: originX,
        top: originY,
        width: 20,
        height: 20,
        marginLeft: -10,
        marginTop: -10,
        borderRadius: '50%',
        background: BALL_COLOR,
        zIndex: 99999,
        pointerEvents: 'none',
        // Sombra limpia y sutil — solo un halo muy tenue
        boxShadow: `0 2px 10px 1px ${BALL_GLOW}`,
      }}
      // La bolita aparece con un pequeño "pop" al inicio y mantiene opacidad 1
      // durante todo el vuelo — nunca se desvanece antes de llegar
      animate={{
        x: [0, arcDrift, dx],
        y: [0, dy * 0.28 - arcLift, dy],
        scale: [0, 1.15, 0.95],
        opacity: [1, 1, 1],
      }}
      transition={{
        duration: 1.1,
        ease: [0.2, 0.55, 0.35, 0.96],
        times: [0, 0.5, 1],
      }}
      onAnimationComplete={() => {
        // En cuanto llega: dispara el burst en el portal + bounce del ícono
        triggerBurst(dest.x, dest.y)
        incrementGlow()
        removeAnimation(id)
      }}
    />
  )
}

// ─── Componente raíz (portal) ─────────────────────────────────────────────
export default function CartFlyEffect() {
  const [mounted, setMounted] = useState(false)
  const animations = useCartAnimationStore((s) => s.animations)
  const bursts = useCartAnimationStore((s) => s.bursts)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return createPortal(
    <>
      {animations.map((anim) => (
        <FlyBall key={anim.id} {...anim} />
      ))}
      {bursts.map((burst) => (
        <ImpactBurst key={burst.id} {...burst} />
      ))}
    </>,
    document.body,
  )
}
