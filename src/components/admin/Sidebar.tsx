'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Package, Grid3X3, ShoppingBag,
  Warehouse, Settings, LogOut, ChevronLeft, ChevronRight,
  Menu, X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { label: 'Panel', href: '/admin', icon: LayoutDashboard },
  { label: 'Productos', href: '/admin/products', icon: Package },
  { label: 'Categorías', href: '/admin/categories', icon: Grid3X3 },
  { label: 'Pedidos', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Inventario', href: '/admin/inventory', icon: Warehouse },
  { label: 'Ajustes', href: '/admin/settings', icon: Settings },
]

interface SidebarProps {
  userEmail?: string
}

export default function Sidebar({ userEmail }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const initial = userEmail?.charAt(0).toUpperCase() || 'A'

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-5 py-6 mb-2">
        <Link href="/admin" className="font-display text-white tracking-[0.08em] whitespace-nowrap">
          {collapsed ? (
            <span className="text-[16px]">MÉ</span>
          ) : (
            <span className="text-[16px]">MAISON ÉLARA</span>
          )}
        </Link>
      </div>

      <div className="h-[1px] bg-white/10 mx-4 mb-4" />

      {/* Nav */}
      <nav className="flex-1 px-3">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href)
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded transition-all duration-200 group relative',
                    active
                      ? 'bg-white/[0.12] text-white'
                      : 'text-white/50 hover:text-white hover:bg-white/[0.08]'
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 bg-champagne rounded-r" />
                  )}
                  <Icon className="h-5 w-5 shrink-0" strokeWidth={1.5} />
                  {!collapsed && (
                    <span className="font-body text-[13px]">{item.label}</span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="h-[1px] bg-white/10 mx-4 my-4" />

      {/* User & Logout */}
      <div className="px-4 pb-5">
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <span className="h-8 w-8 flex items-center justify-center bg-champagne text-charcoal font-body text-[12px] font-medium rounded-full shrink-0">
            {initial}
          </span>
          {!collapsed && (
            <span className="font-body text-[12px] text-white/60 truncate flex-1">
              {userEmail}
            </span>
          )}
          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            className="text-white/40 hover:text-white transition-colors shrink-0"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-40 bg-charcoal transition-all duration-300 ease-luxury',
          collapsed ? 'w-[72px]' : 'w-[260px]'
        )}
      >
        {sidebarContent}

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 h-6 w-6 flex items-center justify-center bg-charcoal border border-white/20 rounded-full text-white/60 hover:text-white transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </button>
      </aside>

      {/* Desktop spacer */}
      <div className={cn('hidden lg:block shrink-0 transition-all duration-300', collapsed ? 'w-[72px]' : 'w-[260px]')} />

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-30 h-10 w-10 flex items-center justify-center bg-charcoal text-white rounded"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" strokeWidth={1.5} />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-40 bg-black/50"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-[260px] bg-charcoal flex flex-col"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 text-white/60 hover:text-white"
              >
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
