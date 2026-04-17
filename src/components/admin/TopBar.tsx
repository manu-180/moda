'use client'

import { usePathname } from 'next/navigation'
import { Search, Bell } from 'lucide-react'

const PAGE_TITLES: Record<string, string> = {
  '/admin': 'Panel',
  '/admin/products': 'Productos',
  '/admin/categories': 'Categorías',
  '/admin/orders': 'Pedidos',
  '/admin/inventory': 'Inventario',
  '/admin/settings': 'Ajustes',
}

export default function TopBar() {
  const pathname = usePathname()

  // Match exact or parent route
  const title =
    PAGE_TITLES[pathname] ||
    Object.entries(PAGE_TITLES).find(([key]) => pathname.startsWith(key) && key !== '/admin')?.[1] ||
    'Panel'

  return (
    <header className="h-16 bg-white border-b border-pale-gray flex items-center justify-between px-6 lg:px-8">
      {/* Left spacer for mobile hamburger */}
      <div className="lg:hidden w-10" />

      <h1 className="font-body text-[18px] text-charcoal">{title}</h1>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center border border-pale-gray px-3 py-1.5 gap-2">
          <Search className="h-4 w-4 text-warm-gray" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Buscar…"
            className="font-body text-[13px] text-charcoal bg-transparent border-none outline-none w-[160px] placeholder:text-warm-gray"
          />
        </div>
        <button className="relative text-warm-gray hover:text-charcoal transition-colors">
          <Bell className="h-5 w-5" strokeWidth={1.5} />
          <span className="absolute -top-1 -right-1 h-2 w-2 bg-muted-red rounded-full" />
        </button>
      </div>
    </header>
  )
}
