'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, AlertTriangle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastVariant = 'success' | 'error' | 'info'

interface ToastItem {
  id: string
  message: string
  variant: ToastVariant
}

interface ToastContextType {
  toast: (message: string, variant?: ToastVariant) => void
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

const icons: Record<ToastVariant, ReactNode> = {
  success: <Check className="h-4 w-4" />,
  error: <AlertTriangle className="h-4 w-4" />,
  info: <Info className="h-4 w-4" />,
}

const variantStyles: Record<ToastVariant, string> = {
  success: 'border-l-2 border-l-deep-forest',
  error: 'border-l-2 border-l-muted-red',
  info: 'border-l-2 border-l-charcoal',
}

const iconStyles: Record<ToastVariant, string> = {
  success: 'text-deep-forest',
  error: 'text-muted-red',
  info: 'text-charcoal',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const toast = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { id, message, variant }])

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  function dismiss(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className={cn(
                'pointer-events-auto relative flex items-center gap-3 bg-white px-5 py-3.5 shadow-sm border border-pale-gray min-w-[280px] max-w-[400px]',
                variantStyles[t.variant]
              )}
            >
              <span className={iconStyles[t.variant]}>{icons[t.variant]}</span>
              <p className="flex-1 font-body text-[13px] text-charcoal">
                {t.message}
              </p>
              <button
                onClick={() => dismiss(t.id)}
                className="text-warm-gray hover:text-charcoal transition-colors duration-200"
                aria-label="Dismiss"
              >
                <X className="h-3.5 w-3.5" />
              </button>

              {/* Progress bar */}
              <motion.div
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 4, ease: 'linear' }}
                className={cn(
                  'absolute bottom-0 left-0 right-0 h-[2px] origin-left',
                  t.variant === 'success' && 'bg-deep-forest/30',
                  t.variant === 'error' && 'bg-muted-red/30',
                  t.variant === 'info' && 'bg-charcoal/20'
                )}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export default ToastProvider
