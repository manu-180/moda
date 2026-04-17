import { create } from 'zustand'

export interface FlyAnimation {
  id: string
  originX: number
  originY: number
}

export interface BurstAnimation {
  id: string
  x: number
  y: number
}

interface CartAnimationStore {
  animations: FlyAnimation[]
  bursts: BurstAnimation[]
  /** Incrementa con cada impacto — úsalo como key para re-disparar animaciones en Navbar */
  bagGlowCount: number
  triggerFly: (originX: number, originY: number) => void
  removeAnimation: (id: string) => void
  triggerBurst: (x: number, y: number) => void
  removeBurst: (id: string) => void
  incrementGlow: () => void
}

export const useCartAnimationStore = create<CartAnimationStore>((set) => ({
  animations: [],
  bursts: [],
  bagGlowCount: 0,

  triggerFly: (originX, originY) => {
    const id = `fly-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    set((s) => ({ animations: [...s.animations, { id, originX, originY }] }))
  },

  removeAnimation: (id) =>
    set((s) => ({ animations: s.animations.filter((a) => a.id !== id) })),

  triggerBurst: (x, y) => {
    const id = `burst-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    set((s) => ({ bursts: [...s.bursts, { id, x, y }] }))
  },

  removeBurst: (id) =>
    set((s) => ({ bursts: s.bursts.filter((b) => b.id !== id) })),

  incrementGlow: () =>
    set((s) => ({ bagGlowCount: s.bagGlowCount + 1 })),
}))
